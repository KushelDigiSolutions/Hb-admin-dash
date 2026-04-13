import { firstValueFrom } from 'rxjs';
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
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss']
})
export class TaxesComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  taxClasses = [];
  taxClassFormGroup: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private apiService: EcommerceService,
    private toaster: ToastrService
  ) { 
    this.taxClassFormGroup = this.formBuilder.group({
      name: [""],
    });
  }

  ngOnInit(){
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Taxes', active: true }];

    this.getTaxes();
  }

  getTaxes(){
    firstValueFrom(this.apiService.getTaxes())
    .then((res:any)=>{
      if(res.data){
        this.taxClasses = res.data;
        for(let taxes of this.taxClasses){
          if(!taxes.taxSlabs.length){
            let data = {
              country: "IN",
              state: "",
              pinCode: "",
              city: "",
              rate: "",
              name: "",
              priority: ""
            }
            taxes.taxSlabs.push(data);
          }
        }
        console.log("tax",this.taxClasses);
      }
    })
    .catch((err:any)=>{
      /** */
    });
  }

  addNewTaxClass(){
    if(this.taxClassFormGroup.get('name').value){
      const data  = {
        name: this.taxClassFormGroup.get('name').value
      }
      firstValueFrom(this.apiService.addTaxClass(data))
      .then((res:any)=>{
        this.getTaxes();
        this.toaster.success(res.message);
        console.log("res",res);
      })
      .catch((err:any)=>{
        this.toaster.error(err);
      });
      this.taxClassFormGroup.reset();
    }
  }

  removeTaxClass(_id){
    const data = {
      _id: _id
    }
    firstValueFrom(this.apiService.removeTaxClass(data))
    .then((res:any)=>{
      this.toaster.success(res.message);
      this.getTaxes();
    })
    .catch((err:any)=>{this.toaster.error(err)})
  }

  addNewRow(item){
    console.log("item",item)
    let data = {
      country: "IN",
      state: "",
      pinCode: "",
      city: "",
      rate: "",
      name: "",
      priority: ""
    }
    item.taxSlabs.push(data);
  }

  removeRow(item){
    item.pop();
  }

  onChange(item, index){
    item.taxSlabs.splice(index, 1);
  }

  saveTaxes(){
    let taxes = [];
    for(let tax of this.taxClasses){
      let data = {
        class: tax._id,
        taxSlabs: tax.taxSlabs
      }
      taxes.push(data);
    }
    firstValueFrom(this.apiService.addTaxes({'taxes':taxes}))
    .then((res:any)=>{
      this.toaster.success(res.message);
    })
    .catch((err:any)=>{
      this.toaster.error(err);
    });
  }

}
