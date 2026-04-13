import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, QueryList, ViewChildren } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { User } from "src/app/core/models/auth.models";
import { RequestHttpParams } from "src/app/core/services/api.service";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { environment } from "src/environments/environment";
import { RemoveModalComponent } from "../../ecommerce/modals/remove/remove-modal/remove-modal.component";
import { BlogListv2RequestParams, LifestyleService } from "../lifestyle.service";

@Component({
  standalone: false,
  selector: 'app-blog-pool',
  templateUrl: './blog-pool.component.html',
  styleUrls: ['./blog-pool.component.scss']
})
export class BlogPoolComponent implements OnInit {
  user: User;
  search: string = '';
  breadCrumbItems: Array<{}>;
  tempPageSize: any;
  tempsearchTerm: any;
  pageSize = 10;
  page = 1;
  count: number;
  imgUrl = environment.imageUrl;

  dataArray = [];
  searchBlogs: any;

  // @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private authService: AuthenticationService,
    private apiService: LifestyleService,
    private toaster: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private modal: NgbModal
  ) { }

  ngOnInit() {
    this.user = this.authService.currentUser()
    this.getBlogList();
  }

  getBlogList() {
    let params: BlogListv2RequestParams = {
      limit: this.pageSize,
      page: this.page,
    };

    if (this.user.role.includes('Editor')) {
      params.assignedEditor = false
    } else {
      params.assignedEditor = true
      params.assignedPublisher = false
      params.isEditorComplete = true
    }

    this.apiService
      .getBlogListV2(params).subscribe((res: any) => {
        if (res.data) {
          this.dataArray = res.data;
          this.count = res.count;
        }
      }, (err: any) => {
        console.log("err", err);
      })
  }

  acceptBlogToReview(id: string, index: number) {
    let req = this.apiService.blogAssignToPublisher(id)
    if (this.user.role.includes('Editor')) {
      req = this.apiService.blogAssignToEditor(id)
    }
    this.spinner.show()
    req.subscribe((res: any) => {
      this.spinner.hide()
      if (res.success) {
        this.toaster.success('Blog added to list for review')
        this.dataArray.splice(index, 1)
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.hide()

    });
  }

  changeValue(event, type) {
    if (type == "page") {
      this.page = event;
    }
    this.getBlogList();
  }

  toggleFxn(data, type) {
    return new Observable((observer) => {
      console.log(data);
      type == "popular"
        ? (data.togglePopularLoading = true)
        : type == "status"
          ? (data.toggleStatusLoading = true)
          : "";
      let body = {
        popular: data.popular,
        status: data.status,
        _id: data._id,
      };
      type == "popular"
        ? (body.popular = !body.popular)
        : type == "status"
          ? (body.status = !body.status)
          : "";
      this.apiService.updateBlog(body).subscribe(
        (res) => {
          type == "popular"
            ? (data.togglePopularLoading = false)
            : type == "status"
              ? (data.toggleStatusLoading = false)
              : "";
          type == "popular"
            ? (data.popular = !data.popular)
            : type == "status"
              ? (data.status = !data.status)
              : "";
          observer.next(true);
        },
        (error) => {
          type == "popular"
            ? (data.togglePopularLoading = false)
            : type == "status"
              ? (data.toggleStatusLoading = false)
              : "";
          observer.next(false);
        }
      );
    });
  }
  removeBlog(id) {

    const data = {
      value: 'blog',
      type: 'blog'
    }

    let modal = this.modal.open(RemoveModalComponent, { size: 'lg' });

    modal.componentInstance.data = data;

    modal.result.then((result) => {
      if (result == 'yes') {
        firstValueFrom(this.apiService.removeBlog(id))
          .then((res: any) => {
            this.toaster.success(res.message);
            this.getBlogList();
          })
          .catch((err: any) => {
            this.toaster.error(err.error);
          });
      }
    })
  }

  // onSort({ column, direction }: SortEvent) {

  //   // resetting other headers
  //   this.headers.forEach(header => {
  //     if (header.sortable !== column) {
  //       header.direction = '';
  //     }
  //   });

  // }
  onSearch(form: NgForm) {
    this.search = form.value.searchTerm.trim();
    this.page = 1;
    if (this.search) {
      this.apiService.algoliaSearch(this.search).subscribe((res: any) => {
        this.dataArray = res.data;
      });
    } else {
      this.getBlogList();
    }
  }
}
