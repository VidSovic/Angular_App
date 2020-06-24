import { Component, OnInit, OnDestroy} from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { Subscription, from } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import {Comment} from '../comment.model';
@Component({
  selector: 'app-comment-create',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.css']
})
export class PostComment implements OnInit{

  form: FormGroup;
  comments: Comment[] = [];
  private postId: string;
  private commentSub: Subscription;
  constructor(public postService: PostService){}

  ngOnInit(){
      this.form = new FormGroup({
          context: new FormControl(null,{validators:[Validators.required]}),
      });
      var url = window.location.pathname;
      this.postId = url.substring(url.lastIndexOf('/') + 1);
      this.postService.getComments(this.postId);
      this.commentSub = this.postService.getCommentUpdateListener().subscribe((commentData: {comments: Comment[]})=>{
        this.comments = commentData.comments;
      });
  }

  onSaveComment(){
    if(this.form.invalid){
      return;
    }
    var url = window.location.pathname;
    this.postId = url.substring(url.lastIndexOf('/') + 1);
    this.postService.addComment(this.form.value.context, this.postId);
    this.form.reset();
  }

}
