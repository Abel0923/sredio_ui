import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = 'http://localhost:3000/auth'; // Change to your server URL
  private apiUrl = 'http://localhost:3000/user'; // Change to your server URL

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
    return this.httpClient.get(this.apiUrl+'/org', {
      headers: { Authorization: `token ${accessToken}` },
    });
  }

  public getAllOrgRepo(accessToken: string, org_name: string): Observable<any>{
    return this.httpClient.get(this.apiUrl+'/org/repo?org_name='+org_name, {
      headers: { Authorization: `token ${accessToken}` },
    });
  }

  public getRepoStats(accessToken: string, org_name: string, repo_name: string): Observable<any>{
    return this.httpClient.get(this.apiUrl+'/org/repo/stats?org_name='+org_name+'&&repo_name='+repo_name, {
      headers: { Authorization: `token ${accessToken}` },
    });
  }


}
