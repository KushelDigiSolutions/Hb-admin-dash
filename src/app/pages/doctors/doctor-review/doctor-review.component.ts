import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { DoctorsService } from "../doctors.service";

@Component({
  standalone: false,
  selector: "app-doctor-review",
  templateUrl: "./doctor-review.component.html",
  styleUrls: ["./doctor-review.component.scss"],
})
export class DoctorReviewComponent implements OnInit {
  consultantId;

  chatMessagesData: Array<{}>;
  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorsService,
    private toaster:ToastrService
  ) {
    console.log("consultant ID", this.consultantId);
    this.route.params.subscribe((res: any) => {
      this.consultantId = res.id;
    });
  }

  ngOnInit(): void {
    console.log("here");
    // let data = [{
    //   name: 'Hemant Tiwari',
    //   time: '16:38',
    //   message: 'This is the dummy text for the reviews which are to be left by the users on the website'
    // }];

    this.doctorService.getDoctorReviews(this.consultantId).subscribe(
      (res: any) => {
        this.chatMessagesData = res.data;
        console.log("Chat ", this.chatMessagesData);
      },
      (err: HttpErrorResponse) => {
        console.log("err", err);
      }
    );

    // this.chatMessagesData = new Array(4).fill('').map(el=>data[0]);
  }

  approveClicked(data) {
    let body = {
      _id: data._id,
      verified: !data.verified,
      publish: !data.publish,
    };
    this.doctorService.verifyAndPublishReview(body)
    .subscribe((res:any)=>{
      this.toaster.success(res.message);
    },(err:any)=>{
      console.log("err",err)
    })
  }
}
