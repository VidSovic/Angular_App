import {Post} from './post.model';
import {Subject, throwError} from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {map, catchError} from 'rxjs/operators';
import { Router } from '@angular/router';
import { Comment } from './comment.model';
import {Vote} from './vote.model';

@Injectable({providedIn: 'root'})
export class PostService{

  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();
  private comments: Comment[] = [];
  private commentsUpdated = new Subject<{comments: Comment[]}>();
  private voted;
  constructor(private http: HttpClient, private router: Router){}

  getPosts(postsPetPage: number, currentPage: number, userId: string){
    const queryParams = `?pagesize=${postsPetPage}&page=${currentPage}&userId=${userId}`;
    this.http.get<{message: string, posts: any, maxPosts: number}>('http://localhost:3000/api/posts'+queryParams)
    .pipe(map((postData)=>{
        return { posts: postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator,
            numVotes: post.numVotes,
            voted: post.voted
          };
        }), maxPosts: postData.maxPosts};
    }))
    .subscribe(transformedPostData =>{
      this.posts = transformedPostData.posts;
      this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
    });
  }

  getComments(id: string){
    this.http.get<{message: string, comments: any}>('http://localhost:3000/api/comment/'+id)
    .pipe(map((postData)=>{
      return {comments: postData.comments.map(comment=>{
        return{
          context: comment.context,
          date: comment.date,
          postId: comment.postId
        };
      })}
    }))
    .subscribe(transformedPostData =>{
      this.comments = transformedPostData.comments;
      this.commentsUpdated.next({comments: [...this.comments]});
    });
  }

  getPostUpdateListener(){
    return this.postsUpdated.asObservable();
  }
  getCommentUpdateListener(){
    return this.commentsUpdated.asObservable();
  }

  getPost(id: string){
    return this.http.get<{_id: string, title:string, content: string, imagePath: string, creator: string}>("http://localhost:3000/api/posts/"+id);
  }
  addPost(title: string, content: string, image: File, userId: string){

    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image,title);
    postData.append("userId", userId);
    this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts',postData).subscribe((responseData)=>{
        this.router.navigate(["/"]);
    });
  }

  addComment(context: string, postId: string){
    const commentData: Comment = {context: context, date: new Date(Date.now()), postId: postId}
    return this.http.post('http://localhost:3000/api/comment/'+postId,commentData).subscribe(()=>{
        this.getComments(postId);
    });
  }

  addVote(postId: string, userId: string){
    const voteData: Vote = {numVotes:0 ,userId: userId, postId: postId};
    this.http.post<{message: string, vote: Vote}>('http://localhost:3000/api/posts/vote',voteData).subscribe((responseData)=>{
        location.reload();
    });
  }

  getNumVotes(postId:string){
      this.http.get<{message: string,numVotes: number}>('http://localhost:3000/api/posts/vote/'+postId).subscribe((responseData)=>{
       return responseData.numVotes;
      });
  }

  checkIfVoted(postId: string, userId: string){
   return this.http.get<{message: string, check: boolean}>('http://localhost:3000/api/posts/vote/'+postId+'/'+userId);
  }

  updatePost(id: string, title: string, content: string, image: File | string){
    let postData: Post |FormData;
    if(typeof image === "object"){
      postData=new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image,title);
    }else{
       postData = {id: id, title: title, content: content,imagePath: image, creator:null, numVotes:0, voted: false}
    }

    this.http.put("http://localhost:3000/api/posts/" + id,postData)
    .subscribe(response => {
      this.router.navigate(["/"]);
    });
  }
  deletePost(postId: string){
    return this.http.delete("http://localhost:3000/api/posts/" + postId);
  }

  getUser(userId: string){
    return this.http.get<{email: string, numVotes: number, numPosts: number}>('http://localhost:3000/api/posts/user/'+userId);
  }
}
