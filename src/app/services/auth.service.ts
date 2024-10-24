import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = 'http://localhost:3000/api/auth';
  private apiUrl = 'http://localhost:3000/api';

  constructor(private httpClient: HttpClient) {
  }

  public getUser(){
    return this.httpClient.get(this.authUrl+"/user")
  }

  public getUserData(accessToken: string): Observable<any> {
    return this.httpClient.get(this.authUrl+'/user', {
      headers: { Authorization: `token ${accessToken}` },
    });
  }


  public removeUser(accessToken: string): Observable<any> {
    return this.httpClient.delete(this.authUrl+'/user', {
      headers: { Authorization: `token ${accessToken}` },
    });
  }

  public getOrg(accessToken: string): Observable<any>{
    return this.httpClient.get(this.apiUrl+'/org/', {
      headers: { Authorization: `token ${accessToken}` },
    });
  }

  public getAllOrgRepo(accessToken: string, org_name: string, page: number, page_size: number): Observable<any>{
    return this.httpClient.get(this.apiUrl+'/org/repo?org_name='+org_name+'&page='+page+'&page_size='+page_size, {
      headers: { Authorization: `token ${accessToken}` },
    });
  }

  public getRepoStats(accessToken: string, org_name: string, repos: any, page: number, page_size: number): Observable<any>{
    return this.httpClient.post(this.apiUrl+'/repo/stats?org_name='+org_name+'&page='+page+'&page_size='+page_size, {repos}, {
      headers: { Authorization: `token ${accessToken}` },
    });
  }

  public getRepoCommits(accessToken: string, org_name: string, repos: any, page: number, page_size: number): Observable<any>{
    return this.httpClient.post(this.apiUrl+'/repo/commits?org_name='+org_name+'&page='+page+'&page_size='+page_size, {repos}, {
      headers: { Authorization: `token ${accessToken}` },
    });
  }

  public getRepoPR(accessToken: string, org_name: string, repos: any, page: number, page_size: number): Observable<any>{
    return this.httpClient.post(this.apiUrl+'/repo/pr?org_name='+org_name+'&page='+page+'&page_size='+page_size, {repos},{
      headers: { Authorization: `token ${accessToken}` },
    });
  }

  public getRepoIssues(accessToken: string, org_name: string, repos: any, page: number, page_size: number): Observable<any>{
    return this.httpClient.post(this.apiUrl+'/repo/issues?org_name='+org_name+'&page='+page+'&page_size='+page_size, {repos}, {
      headers: { Authorization: `token ${accessToken}` },
    });
  }

}
