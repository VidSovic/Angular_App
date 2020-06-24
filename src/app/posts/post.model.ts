export interface Post{
  id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: string;
  numVotes: number;
  voted: Boolean;
}
