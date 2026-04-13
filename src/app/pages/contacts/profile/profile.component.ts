import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { getUserRoles } from "src/app/util/user-role.util";
import { ContactsService } from "../contacts.service";

@Component({
  standalone: false,
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  userId: string;
  userDetails: any;
  form: FormGroup;
  userRoles = [];

  constructor(
    private contactService: ContactsService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder
  ) {
    this.route.params.subscribe((res) => {
      this.userId = res.id;
    });

    this.form = this.formBuilder.group({
      firstName: ["", Validators.required],
      lastName: "",
      phone: ["", Validators.required],
      email: [""],
      DOB: "",
      gender: "",
      role: [["User"], Validators.required],
      description: "",
      _id: ""
    });
  }

  ngOnInit() {
    this.breadCrumbItems = [
      { label: "Contacts" },
      { label: "Profile", active: true },
    ];
    this.userRoles = getUserRoles()
    if (this.userId) {
      this.fetchUserDetail();
    }
  }

  fetchUserDetail() {
    this.spinner.show();
    firstValueFrom(this.contactService.getUserDetail(this.userId))
      .then((res: any) => {
        this.spinner.hide();
        this.userDetails = res.data;
        this.form.patchValue({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          phone: res.data.phone,
          email: res.data.email,
          DOB: res.data.DOB,
          gender: res.data.gender,
          role: res.data.role,
          description: res.data.description,
          _id: res.data._id
        });
      })
      .catch((err) => {
        this.spinner.hide();
        this.toaster.error(err.error?.message || 'Failed to fetch user details');
      });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toaster.error('Please fill required fields');
      return;
    }

    const value = { ...this.form.value };
    this.spinner.show();
    if (!this.userId) {
      delete value._id;

      this.contactService.createUser(value).subscribe((res: any) => {
        this.spinner.hide();
        if (res.success) {
          this.toaster.success("User created successfully");
          this.router.navigateByUrl('/contacts/list')
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.hide();
        this.toaster.error(err.error?.message || 'Something went wrong');
      })
    } else {
      this.contactService.updateUserProfile(value)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.success) {
            this.toaster.success("Profile Updated");
            this.fetchUserDetail();
          }
        }, (err: HttpErrorResponse) => {
          this.spinner.hide();
          this.toaster.error(err.error?.message || 'Something went wrong');
        })
    }
  }
}
