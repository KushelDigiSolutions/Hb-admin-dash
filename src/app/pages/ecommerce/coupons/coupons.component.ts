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
import { NgbdSortableHeader, SortEvent } from '../sortable-directive';
import { Observable, firstValueFrom } from 'rxjs';
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
    NgbModalModule

  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.scss']
})
export class CouponsComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  couponList = [];
  pageSize = 10;
  page = 1;

  tempPageSize;
  tempsearchTerm;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private apiService: EcommerceService,
    private toaster: ToastrService
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Coupons', active: true }];

    this.getCoupons();

  }

  getCoupons() {
    firstValueFrom(this.apiService.getCoupons())
      .then((res: any) => {
        this.couponList = res.data
      })
      .catch((err: any) => { });
  }

  changeValue(event, type) {
    if (type == 'page') {
      this.page = event;
    }
    // this.getCoupons();
    window.scroll(0, 0)
  }

  toggleStatus(data) {
    return new Observable((observer) => {
      data.toggleStatusLoading = true;
      let body = {
        active: !data.active,
        _id: data._id
      }
      this.apiService.updateCoupon(body).subscribe(res => {
        data.toggleStatusLoading = false;
        data.active = !data.active;
        observer.next(true)
      }, error => {
        data.toggleStatusLoading = false;
        observer.next(false)
      })
    });

  }


  removeCoupon(id) {
    firstValueFrom(this.apiService.removeCoupon(id))
      .then((res: any) => {
        this.toaster.success(res.message);
        this.getCoupons();
      })
      .catch((err: any) => { this.toaster.error(err) });
  }


  onSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

  }


}
