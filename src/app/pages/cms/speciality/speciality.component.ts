import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EcommerceService } from '../../ecommerce/ecommerce.service';
import { NgbdSortableHeader, SortEvent } from '../../ecommerce/sortable-directive';
import { CmsService } from '../cms.service';
import { AddSpecialityComponent } from './add-speciality/add-speciality.component';


@Component({
  standalone: false,
  selector: 'app-speciality',
  templateUrl: './speciality.component.html',
  styleUrls: ['./speciality.component.scss']
})
export class SpecialityComponent implements OnInit {

  breadCrumbItems: Array<{}>; s
  tempPageSize: any;
  tempsearchTerm: any;
  pageSize = 10;
  page = 1;
  search: string = '';

  dataArray = [];
  imgUrl = environment.imageUrl;

  childId;


  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private apiService: EcommerceService,
    private cmsService: CmsService,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private modalService: NgbModal
  ) {
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Doctor' }, { label: 'Doctor Type', active: true }];

    this.childId = this.route.snapshot.params.id;
    this.childId
      ? this.fetchCategory()
      : this.getTypes();

  }

  getTypes() {
    const url = `limit=${this.pageSize}&page=${this.page}`;
    firstValueFrom(this.apiService.getTypes(url))
      .then((res: any) => {
        if (res.data) {
          this.dataArray = res.data;
        }
      })
      .catch((err: any) => {
        console.log("err", err);
      });
  }

  fetchCategory() {
    let url = `/detail ? _id=${this.childId}`;

    firstValueFrom(this.apiService.getCategoryList(url))
      .then((res : any) => {
        this.dataArray = res.data.children;
      })
      .catch((err: any) => {
      })
  }

  changeValue(event, type) {
    if (type == 'page') {
      this.page = event;
    }
    this.getTypes();
  }

  editType(id) {
    const data = {
      typeId: id
    }

    let modal = this.modalService.open(AddSpecialityComponent, { size: "lg" });

    modal.componentInstance.data = data;

    modal.result.then((result) => {

      if (result) {
        // let type = {
        //   name: result.data.name,
        //   _id: result.data._id
        // }
        this.getTypes();
      }
    }).catch((err: any) => {
      console.log("err", err);
    })
  }

  removeType(data: any) {
    let { _id, name } = data
    if (confirm(`Are you sure you want to delete "${name}" category ? `)) {
      firstValueFrom(this.cmsService.removeType(_id))
        .then((res : any) => {
          this.toaster.success(res.message);
          this.getTypes();
        })
        .catch((err: any) => { });
    }

  }

  onSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

  }

  toggleTop(data) {
    return new Observable((observer) => {
      console.log(data);
      data.toggleTopLoading = true;
      let body = {
        isTop: !data.isTop,
        _id: data._id
      }
      this.apiService.toggleCategoryTop(body).subscribe(res => {
        data.toggleTopLoading = false;
        data.isTop = !data.isTop;
        observer.next(true)
      }, error => {
        data.toggleTopLoading = false;
        observer.next(false)
      })
    });

  }

  toggleFeatured(data) {
    return new Observable((observer) => {
      console.log(data);
      data.toggleFeaturedLoading = true;
      let body = {
        isFeatured: !data.isFeatured,
        _id: data._id
      }
      this.apiService.toggleCategoryFeatured(body).subscribe(res => {
        data.toggleFeaturedLoading = false;
        data.isFeatured = !data.isFeatured;
        observer.next(true)
      }, error => {
        data.toggleFeaturedLoading = false;
        observer.next(false)
      })
    });

  }

  navigateToCategory(data) {
    this.router.navigate(['ecommerce/add-category'], { state: { data: data } });
  }

  addSpeciality() {
    const data = {
      path: 'add-doctor'
    }

    let modal = this.modalService.open(AddSpecialityComponent, { size: "lg" });

    modal.componentInstance.data = data;

    modal.result.then((result) => {

      if (result.data) {
        // let type = {
        //   name: result.data.name,
        //   _id: result.data._id
        // }
        this.getTypes();
      }
    }).catch((err: any) => {
      console.log("err", err);
    })
  }

}