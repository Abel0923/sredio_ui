import {Component,inject, signal} from '@angular/core';
import { AuthService } from './services/auth.service';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sredio_project';
  panelOpenState = signal(false);
  token: any = null
  userData: any
  orgData: any
  repos: any

  selectedOrg: any = null
  selectedRepo: any = null

  loading: boolean = false
  columnStatsDefs: any = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
    {headerName: 'UserID', field: 'userId'},
    {headerName: 'User', field: 'user'},
    {headerName: 'Total Commits', field: 'totalCommits'},
    {headerName: 'Total Pull Request', field: 'totalPullRequests'},
    {headerName: 'Total Issues', field: 'totalIssues'},
  ];
  rowStatsData: any[] = [];



  columnRepoDefs: any = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
    {headerName: 'ID', field: 'id'},
    {headerName: 'Name', field: 'name'},
    {headerName: 'Link', field: 'link'},
    {headerName: 'Slug', field: 'slug'}

  ];
  rowRepoData: any[] = [];


  constructor(private authService: AuthService, private route: ActivatedRoute){

  }

  private _snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.authService.getUserData(this.token).subscribe(data => {
          this.userData = data;
          this.openSnackBar(`Welcome, ${this.userData.displayName}`)
        },(err) => {
          this.openSnackBar(err?.error?.message || "Please connect again")
        });

        this.authService.getOrg(this.token).subscribe(data => {
          console.log("orgData >> ", data)
          this.orgData = data.data
          this.openSnackBar(`Organization Data loaded`)
        },(err: any) => {
          this.openSnackBar(err?.message || 'Organization is not loaded');
        });

      }else{
        this.openSnackBar(`Something Went wrong!`)
      }
    });


  }

  connectToGithub(){
    window.location.href = 'http://localhost:3000/auth/github';
  }

  removeToGithub(){
    if (this.token) {
      this.authService.removeUser(this.token).subscribe(data => {
        this.userData = null
        this.openSnackBar(`You are disconnecting`)
      });
    }
  }

  getDate(date:any) {
    try{
      const datestr = moment(parseInt(date)).format('YYYY-MM-DD HH:mm:ss');
      return datestr
    }catch(_err){
      return new Date()
    }
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '',{
      duration: 3000
    });
  }

  getAllOrgRepo(event: any){
    this.loading = true;
    if (this.token && this.selectedOrg) {
      this.authService.getAllOrgRepo(this.token, this.selectedOrg).subscribe(data => {
        this.rowRepoData = data.data.map((_res: any) => {
          const { id, name, clone_url,html_url, slug } = _res;
          console.log({clone_url}, {html_url})
          return { id, name, clone_url: html_url || clone_url, slug: slug || '-' };
        });
        this.openSnackBar('Repositories have been loaded');
        this.loading = false;
      },(err: any) => {
        this.openSnackBar(err?.message || 'Repository is not loaded');
      });
    }
  }
  getRepoStats(event: any){
    this.selectedRepo = event.data;
    this.loading = true;

    if (this.token && this.selectedOrg && this.selectedRepo) {
      this.authService.getRepoStats(this.token, this.selectedOrg, this.selectedRepo.name).subscribe(data => {
        this.rowStatsData = data.data.map((_res: any) => {
          console.log("REPOSSSS >> ", data.data)
          const { userId, user, totalCommits,totalPullRequests, totalIssues } = _res;
          return { userId, user, totalCommits, totalPullRequests, totalIssues };
        });
        this.loading = false;
        this.openSnackBar('Repository Stats have been loaded');
      },(err: any) => {
        this.openSnackBar(err?.message || 'Repository Stats is not loaded');
      });
    }
  }
}


