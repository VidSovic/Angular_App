import{Component, OnInit, OnDestroy} from "@angular/core";
import {Post} from '../post.model'
import { PostService } from '../posts.service';
import { Subscription} from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';
@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy{
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage= 2;
  currentPage=1;
  userId: string;
  pageSizeOptions= [1,2,5,10];
  userIsAuthenticated = false;
  voted = false;
  private postsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public postsService: PostService, private authService: AuthService){}

  ngOnInit(){
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postsService.getPosts(this.postsPerPage,this.currentPage, this.userId);
    this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData: {posts: Post[], postCount: number}) =>{
      this.isLoading = false;
      this.totalPosts = postData.postCount;
      this.posts = postData.posts;
    });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated=>{
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  checkIfVoted(){
      this.voted = false;
      this.postsService.checkIfVoted("5ea6dce922d65138dcf03b01", "5ea466b2772cec5a48bad116").subscribe(postData =>{
        this.voted = postData.check;
      });
  }

  onChangedPage(pageData: PageEvent){
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage,this.currentPage,this.userId);
  }
  onDelete(postId: string){
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(()=>{
      this.postsService.getPosts(this.postsPerPage, this.currentPage, this.userId);
    }, () =>{
      this.isLoading = false;
    });
  }
  ngOnDestroy(){
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onVote(postId: string){
    this.userId = this.authService.getUserId();
    this.postsService.addVote(postId,this.userId);
  }
}
