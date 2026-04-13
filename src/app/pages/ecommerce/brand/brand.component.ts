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
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  tempPageSize: any;
  tempsearchTerm: any;
  pageSize = 10;
  page = 1;
  count: number;
  imgUrl = environment.imageUrl;

  dataArray = [];


  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private apiService: EcommerceService,
    private toaster: ToastrService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Brands', active: true }];

    this.getBrandList();
  }

  getBrandList() {
    const url = `?limit=${this.pageSize}&page=${this.page}`;
    this.apiService.getBrandList(url)
      .subscribe({
        next: (res: any) => {
          if (res.data.brands) {
            this.dataArray = res.data.brands;
            this.count = res.data.count;
          }
        },
        error: (err: any) => {
          console.log("err", err);
        }
      });
  }

  changeValue(event, type) {
    if (type == 'page') {
      this.page = event;
    }
    this.getBrandList();
  }

  toggleTop(data) {
    return new Observable((observer) => {
      data.toggleTopLoading = true;
      let body = {
        isTop: !data.isTop,
        _id: data._id
      };
      this.apiService.toggleBrandTop(body).subscribe(res => {
        data.toggleTopLoading = false;
        data.isTop = !data.isTop;
        observer.next(true);
      }, error => {
        data.toggleTopLoading = false;
        observer.next(false);
      });
    });

  }
  removeBrand(id) {
    this.apiService.removeBrand(id)
      .subscribe({
        next: (res: any) => {
          this.toaster.success(res.message);
          this.getBrandList();
        },
        error: (err: any) => {
          this.toaster.error(err.error);
        }
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

}
