import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountType } from '../models/accountType';

@Injectable({
  providedIn: 'root'
})
export class AccountTypeService {
  private url = 'api/AccountType';

  constructor(private http: HttpClient) {}

  public getAccountTypes(): Observable<AccountType[]> {
    return this.http.get<AccountType[]>(`${this.url}`);
  }
}