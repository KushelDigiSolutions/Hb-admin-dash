import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { User } from './user';
import { UserService } from './user.service';
import { NgbdSortableHeader, SortEvent } from './sortable.directive';
import { environment } from 'src/environments/environment';
import { ContactsService } from '../contacts.service';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from '../../consultation/modals/delete-modal/delete-modal.component';
import { ToastrService } from 'ngx-toastr';
import { CsvService } from '../../../core/services/csv.service';

const FILTER_PAG_REGEX = /[^0-9]/g;

@Component({
  standalone: false,
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss'],
  providers: [UserService, DecimalPipe]
})
export class UserlistComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  term: any;
  search: string = '';
  searchProducts: Array<any> = [];
  page = 1;
  pageSize = 10;
  users$: any[];
  total$: number;
  s3base = environment.imageUrl;
  roles: any[] = [];
  usersDownload: any[] = [];
  selectedRole = '';

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    public service: UserService,
    private contactService: ContactsService,
    private modalService: NgbModal,
    private csvService: CsvService,
    private toaster: ToastrService) {
  }
  
  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Contacts' }, { label: 'User List', active: true }];
    this.getUSerList();
    this.contactService.getRoles().subscribe(data => {
      this.roles = data.map(r => ({ name: r }));
    });
  }

  getUSerList() {
    if (this.search) {
      this.contactService.searchUsers(this.search, { limit: this.pageSize, page: this.page }).subscribe(res => {
        this.users$ = res.data;
        this.total$ = res.count;
      });
    } else {
      let url = `limit=${this.pageSize}&page=${this.page}`;
      this.contactService.getUsersListing(url)
        .subscribe((res: any) => {
          this.users$ = res.data;
          this.total$ = res.count;
        }, (err: any) => {
          this.toaster.error('Failed to load user list');
        });
    }
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  onSearch(form: NgForm) {
    this.search = (form.value.searchTerm || '').trim();
    this.page = 1;
    this.getUSerList();
  }

  changeValue(event, type) {
    if (type == 'page') {
      this.page = event;
    }
    this.getUSerList();
  }

  onDelete(id) {
    const modalRef = this.modalService.open(DeleteModalComponent);
    modalRef.result.then((res) => {
      if (res) {
        this.contactService.deleteUser(id).subscribe(res => {
          this.toaster.success('User deleted successfully');
          this.getUSerList();
        });
      }
    }).catch(err => {});
  }

  removeUser(id) {
    this.onDelete(id);
  }

  pageChanged() {
    this.getUSerList();
  }

  selectPage(page: string) {
    this.page = parseInt(page, 10) || 1;
    this.getUSerList();
  }

  formatInput(input: HTMLInputElement) {
    input.value = input.value.replace(FILTER_PAG_REGEX, '');
  }

  onRoleChange(role: string) {
    // Implement role filtering logic if needed
    console.log('Role changed to:', role);
    this.page = 1;
    this.getUSerList();
  }

  downloadCSV() {
    this.onDownload();
  }

  onDownload() {
    this.contactService.getUsersListing(`limit=10000&page=1`).subscribe((res: any) => {
      this.usersDownload = res.data.map(el => {
        return {
          Name: `${el.firstName} ${el.lastName}`,
          Email: el.email,
          Phone: el.phone,
          Role: (el.role || []).join(', ')
        }
      });
      try {
        this.csvService.downloadCSV(this.usersDownload, "UserList");
      } catch (err) {
        console.log(err);
      }
    });
  }
}
