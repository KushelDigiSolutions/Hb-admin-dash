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
import { UIModule } from '../../../../shared/ui/ui.module';
import { EcommerceService } from '../../ecommerce.service';
import { ToastrService } from 'ngx-toastr';
import { TransactionService } from '../../orders/transaction.service';
import { Transaction } from '../../orders/transaction';
import { NgbdSortableHeader, SortEvent } from '../../sortable-directive';
import { AddVariationComponent } from '../../modals/add-variation/add-variation.component';
import { Observable, of, firstValueFrom } from 'rxjs';
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
  selector: "app-variations",
  templateUrl: "./variations.component.html",
  styleUrls: ["./variations.component.scss"],
  providers: [TransactionService, DecimalPipe],
})
export class VariationsComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  attributeName: any;
  dataArray = [];

  transactions$: Observable<Transaction[]>;
  total$: Observable<number>;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  constructor(
    public service: TransactionService,
    private apiService: EcommerceService,
    private toaster: ToastrService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.transactions$ = service.transactions$;
    this.total$ = service.total$;
  }

  ngOnInit() {
    this.breadCrumbItems = [
      { label: "Ecommerce" },
      { label: "Variations", active: true },
    ];

    this.getVariations();
  }

  getVariations() {
    firstValueFrom(this.apiService.getVariations())
      .then((res: any) => {
        if (res.data) {
          this.dataArray = res.data;
          this.total$ = of(this.dataArray.length);
        }
      })
      .catch((err: any) => {
        this.toaster.error(err.error);
      });
  }

  openVariationAddmodal(data='') {
    const modalRef = this.modalService
      .open(AddVariationComponent, { size: "lg" });
      
      modalRef.componentInstance.data = data;
      
      modalRef.result.then(
        (result) => {
          if (result == true) {
            this.getVariations();
          }
        },
        (reason) => {
          console.log("reason", reason);
        }
      );
  }

  deleteVariation(id) {
    firstValueFrom(this.apiService.deleteVariation(id))
      .then((res: any) => {
        this.toaster.success("Variation removed Successfully");
        this.getVariations();
        console.log("res", res);
      })
      .catch((err: any) => {
        this.toaster.error(err.error.message);
      });
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = "";
      }
    });

    // this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
}
