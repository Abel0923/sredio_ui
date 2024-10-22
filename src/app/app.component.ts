import {Component,inject, signal} from '@angular/core';
import { AuthService } from './services/auth.service';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  ColDef,
  ColGroupDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
  RowSelectionOptions,
  createGrid
} from "ag-grid-community";


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
  selectedRepo: any[] = []

  loading: boolean = false
  paginationPageSize: number = 200

  selectedRows: any[] = []; // Array to store selected rows


  columnStatsDefs: any = [
    {headerName: 'UserID', field: 'userId'},
    {headerName: 'User', field: 'user'},
    {headerName: 'Total Commits', field: 'totalCommits'},
    {headerName: 'Total Pull Request', field: 'totalPullRequests'},
    {headerName: 'Total Issues', field: 'totalIssues'},
  ];
  rowStatsData: any[] = [];


  defaultColDef: any = {
    flex: 1
  }

  columnRepoDefs: any = [
    {headerName: 'ID', field: 'id'},
    {headerName: 'Name', field: 'name'},
    {headerName: 'Link', field: 'link'},
    {headerName: 'Slug', field: 'slug'},
    {headerName: 'Included', field: 'include' , headerCheckboxSelection: true, checkboxSelection: true}
  ];
  rowRepoData: any[] = [];
  paginationPageSizeSelector: any[] = [3,5,10,20,30]
  public totalPages: number = 0;
  private gridApi_repo!: GridApi<any>;
  public page_repo: number = 1
  public page_size_repo: number = 3

  private gridApi_repo_stats!: GridApi<any>;
  public page_repo_stats: number = 1
  public page_size_repo_stats: number = 3



  columnCommitDefs: any = [
    {headerName: 'Repo', field: 'repo'},
    {headerName: 'Sha', field: 'sha'},
    {headerName: 'Author', field: 'author'},
    {headerName: 'Message', field: 'message'},
    {headerName: 'Comment Count', field: 'comment_count'}
  ];
  rowCommitData: any[] = [];


  columnPRDefs: any = [
    {headerName: 'Repo', field: 'repo'},
    {headerName: 'Title', field: 'title'},
    {headerName: 'User', field: 'user'},
    {headerName: 'Body', field: 'body'},
  ];
  rowPRData: any[] = [];

  columnIssueDefs: any = [
    {headerName: 'Repo', field: 'repo'},
    {headerName: 'Title', field: 'title'},
    {headerName: 'User', field: 'user'},
    {headerName: 'Body', field: 'body'},
  ];
  rowIssueData: any[] = [];




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

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi_repo = params.api;
  }

  onGridReadyStats(params: GridReadyEvent<any>) {
    this.gridApi_repo_stats = params.api;
  }

  connectToGithub(){
    window.location.href = 'http://localhost:3000/api/auth/github';
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

  getAllOrgRepo(){

    this.loading = true;
    if (this.token && this.selectedOrg) {
      this.authService.getAllOrgRepo(this.token, this.selectedOrg, this.page_repo, this.page_size_repo ).subscribe(data => {
        this.rowRepoData = data.data.map((_res: any) => {
          const { id, name, clone_url,html_url, slug } = _res;
          return { id, name, clone_url: html_url || '-', link: '-', slug: slug || '-' };
        });

        this.gridApi_repo.setGridOption("rowData", this.rowRepoData);

        this.openSnackBar('Repositories have been loaded');
        this.loading = false;
      },(err: any) => {
        this.openSnackBar(err?.message || 'Repository is not loaded');
      });
    }
  }


  getAllOrgRepoByPage(event: any) {
    if(this.gridApi_repo){
      if(this.page_repo == (this.gridApi_repo.paginationGetCurrentPage())){
      this.page_repo = this.gridApi_repo.paginationGetCurrentPage()+1
      this.page_size_repo = 1
      this.getAllOrgRepo();
    }

    }
  }

  setSelectedRepos(event: any){
    const selectedRows = event.api.getSelectedRows()
    this.selectedRepo = selectedRows
  }

  getRepoStats(){
    this.loading = true;
    if (this.token && this.selectedOrg && this.selectedRepo.length > 0) {
      this.authService.getRepoStats(this.token, this.selectedOrg, this.selectedRepo, this.page_repo_stats, this.page_size_repo_stats).subscribe(data => {
        this.rowStatsData = data.data.map((_res: any) => {
          const { userId, user, totalCommits,totalPullRequests, totalIssues } = _res;
          return { userId, user, totalCommits, totalPullRequests, totalIssues };
        });
        this.getCommits()
        this.getPullRequests()
        this.getIssues()
        this.loading = false;
        this.openSnackBar('Repository Stats have been loaded');
      },(err: any) => {
        this.openSnackBar(err?.message || 'Repository Stats is not loaded');
        this.loading = false;
      });
    }
  }

  getAllOrgRepoStatsByPage(event: any, type: String) {
    if(this.page_repo_stats == (this.gridApi_repo_stats.paginationGetCurrentPage())){

      this.page_repo_stats = this.gridApi_repo_stats.paginationGetCurrentPage()+1
      this.page_size_repo_stats = 1

      switch(type){
        case 'repo':
            this.getRepoStats();

          break
        case 'commit':
          this.getCommits();
          break

        case 'pr':
          this.getPullRequests();
        break

        case 'issues':
          this.getIssues();
        break
      }
  }
  }


  getCommits(){
    this.loading = true;
    if (this.token && this.selectedOrg && this.selectedRepo.length > 0) {
      this.authService.getRepoCommits(this.token, this.selectedOrg, this.selectedRepo, this.page_repo_stats, this.page_size_repo_stats).subscribe(data => {
        this.rowCommitData = data.data.map((_res: any) => {
          const { commit, sha, repo_name } = _res;
          const { author, comment_count, message } = commit
          const { name  } = author
          return { repo_name, sha, name, message, comment_count };
        });
        this.loading = false;
        this.openSnackBar('Commit have been loaded');
      },(err: any) => {
        this.openSnackBar(err?.message || 'Commit is not loaded');
        this.loading = false;
      });
    }
  }
  getPullRequests(){
    this.loading = true;
    if (this.token && this.selectedOrg && this.selectedRepo.length > 0) {
      this.authService.getRepoPR(this.token, this.selectedOrg, this.selectedRepo, this.page_repo_stats, this.page_size_repo_stats).subscribe(data => {
        this.rowPRData = data.data.map((_res: any) => {
          const { repo, title, user, body } = _res;
          return { repo, title, user: user.login, body };
        });
        this.loading = false;
        this.openSnackBar('Pull Request have been loaded');
      },(err: any) => {
        this.openSnackBar(err?.message || 'Pull Request is not loaded');
        this.loading = false;
      });
    }
  }

  getIssues(){
    this.loading = true;
    if (this.token && this.selectedOrg && this.selectedRepo.length > 0) {
      this.authService.getRepoIssues(this.token, this.selectedOrg, this.selectedRepo, this.page_repo_stats, this.page_size_repo_stats).subscribe(data => {
        this.rowIssueData = data.data.map((_res: any) => {
          const { repo, title, user,body } = _res;
          return { repo, title, user: user.login, body };
        });
        this.loading = false;
        this.openSnackBar('Issues have been loaded');
      },(err: any) => {
        this.openSnackBar(err?.message || 'Issues is not loaded');
        this.loading = false;
      });
    }
  }
}


