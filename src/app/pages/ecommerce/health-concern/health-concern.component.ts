import { HbSwitchComponent } from 'src/app/shared/ui/hb-switch/hb-switch.component';
import { CommonModule, AsyncPipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, NgModel, NgForm, FormGroup, Validators, AbstractControl, FormArray } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule, NgbHighlight, NgbAccordionModule, NgbTypeaheadModule, NgbCollapseModule, NgbDatepickerModule, NgbModalModule, NgbModal, NgbActiveModal, NgbDate, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightDirective } from '@ng-select/ng-option-highlight';
import { DropzoneModule } from 'src/app/components/dropzone/dropzone.module';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, Input, Output, EventEmitter, ViewEncapsulation, AfterViewInit, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { UIModule } from '../../../shared/ui/ui.module';
import { EcommerceService } from '../ecommerce.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { NgbdSortableHeader, SortEvent } from '../sortable-directive';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbPaginationModule,
    NgbTooltipModule,
    NgbHighlight,
    NgbAccordionModule,
    NgbTypeaheadModule,
    NgbCollapseModule,
    NgbDatepickerModule,
    UIModule,
    NgSelectModule,
    NgOptionHighlightDirective,
    DropzoneModule,
    NgbModalModule,
    NgbdSortableHeader,
    HbSwitchComponent
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-health-concern',
  templateUrl: './health-concern.component.html',
  styleUrls: ['./health-concern.component.scss']
})
export class HealthConcernComponent implements OnInit {


  breadCrumbItems: Array<{}> = [];
  tempPageSize: any;
  tempsearchTerm: any;
  pageSize = 10;
  page = 1;

  dataArray = [];
  count: number;
  imgUrl = environment.imageUrl;
  childId;


  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private apiService: EcommerceService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Category', active: true }];


    this.childId = this.route.snapshot.params.id;
    if (this.childId) {
      this.fetchHealthConcern();
    } else {
      this.getHealthConcern();
    }

  }

  getHealthConcern() {
    const url = `?limit=${this.pageSize}&page=${this.page}`;
    this.spinner.show();
    this.apiService.getHealthConcernList(url)
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.data.healthConcerns) {
            this.dataArray = res.data.healthConcerns;
            this.count = res.data.count;
          }
        },
        error: (err: any) => {
          this.spinner.hide();
          console.log("err", err);
        }
      });
  }

  fetchHealthConcern() {
    let url = `/detail?products=false&filter=false&_id=${this.childId}`;
    this.spinner.show();
    this.apiService.getHealthConcernList(url)
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.dataArray = res.data.children;
        },
        error: (err: any) => {
          this.spinner.hide();
        }
      });
  }

  changeValue(event, type) {
    if (type == 'page') {
      this.page = event;
    }
    this.getHealthConcern();
  }

  removeHealthConcern(id) {
    this.apiService.removeHealthConcern(id)
      .subscribe({
        next: (res: any) => {
          this.toastr.success(res.message);
          if (this.childId) {
            this.fetchHealthConcern();
          } else {
            this.getHealthConcern();
          }
        },
        error: (err: any) => { }
      });
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
      data.toggleTopLoading = true;
      let body = {
        isTop: !data.isTop,
        _id: data._id
      };
      this.apiService.toggleHealthConcernTop(body).subscribe(res => {
        data.toggleTopLoading = false;
        data.isTop = !data.isTop;
        observer.next(true);
      }, error => {
        data.toggleTopLoading = false;
        observer.next(false);
      });
    });

  }

  toggleFeatured(data) {
    return new Observable((observer) => {
      data.toggleFeaturedLoading = true;
      let body = {
        isFeatured: !data.isFeatured,
        _id: data._id
      };
      this.apiService.toggleHealthConcernFeatured(body).subscribe(res => {
        data.toggleFeaturedLoading = false;
        data.isFeatured = !data.isFeatured;
        observer.next(true);
      }, error => {
        data.toggleFeaturedLoading = false;
        observer.next(false);
      });
    });

  }

  toggleStatus(data) {
    return new Observable((observer) => {
      data.toggleStatusLoading = true;
      let body = {
        active: !data.active,
        _id: data._id
      };
      this.apiService.updateHealthConcern(body).subscribe(res => {
        data.toggleStatusLoading = false;
        data.active = !data.active;
        observer.next(true);
      }, error => {
        data.toggleStatusLoading = false;
        observer.next(false);
      });
    });
  }
  toggleVisibilityHome(data) {
    return new Observable((observer) => {
      data.toggleVisibleAtHome = true;
      let body = {
        visibleAtHome: !data.visibleAtHome,
        _id: data._id
      };
      this.apiService.updateHealthConcern(body).subscribe(res => {
        data.toggleVisibleAtHome = false;
        data.visibleAtHome = !data.visibleAtHome;
        observer.next(true);
      }, error => {
        data.toggleVisibleAtHome = false;
        observer.next(false);
      });
    });

  }
  toggleVisibilityLifeStyle(data) {
    return new Observable((observer) => {
      data.toggleVisibleAtLifeStyle = true;
      let body = {
        visibleAtLifeStyle: !data.visibleAtLifeStyle,
        _id: data._id
      };
      this.apiService.updateHealthConcern(body).subscribe(res => {
        data.toggleVisibleAtLifeStyle = false;
        data.visibleAtLifeStyle = !data.visibleAtLifeStyle;
        observer.next(true);
      }, error => {
        data.toggleVisibleAtLifeStyle = false;
        observer.next(false);
      });
    });

  }
  toggleVisibilityConsultUs(data) {
    return new Observable((observer) => {
      data.toggleVisibleAtConsultUs = true;
      let body = {
        visibleAtConsultUs: !data.visibleAtConsultUs,
        _id: data._id
      };
      this.apiService.updateHealthConcern(body).subscribe(res => {
        data.toggleVisibleAtConsultUs = false;
        data.visibleAtConsultUs = !data.visibleAtConsultUs;
        observer.next(true);
      }, error => {
        data.toggleVisibleAtConsultUs = false;
        observer.next(false);
      });
    });

  }
}
