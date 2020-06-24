import{Component, OnInit, OnDestroy} from "@angular/core";
import { AuthService } from 'src/app/auth/auth.service';
import {User} from '../user.model';
import { PostService } from '../posts.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{

  userId: string;
  user: User;
  constructor(public postService: PostService, public authService: AuthService){}

  ngOnInit(){
      this.userId = this.authService.getUserId();
      this.postService.getUser(this.userId).subscribe(user=>{
          this.user = {
            email: user.email,
            numVotes: user.numVotes,
            numPosts: user.numPosts
          }
      })
  }
}
