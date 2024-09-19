import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Pap } from '../models/pap';

@Injectable({
  providedIn: 'root'
})
export class PapService {
  private url = '/api/api/Pap';

  constructor(private http: HttpClient) {}

  public getPaps(): Observable<Pap[]> {
    return this.http.get<Pap[]>(`${this.url}`);
  }

  public updatePaps(formData: FormData): Observable<Pap> {
    return this.http.put<Pap>(
      `${this.url}/update`, 
      formData
    );
  }  
  createPaps(formData: FormData): Observable<Pap> {
    return this.http.post<Pap>(
      `${this.url}/upload`,
      formData
    );
  }  
  public deletePaps(mvisit: Pap): Observable<Pap[]> {
    return this.http.delete<Pap[]>(
      `${this.url}/${mvisit.id}`
    );
  }
  
  getPapsCount(): Observable<number> {
    return this.http.get<number>(`${this.url}/count`);
  }
  
}
