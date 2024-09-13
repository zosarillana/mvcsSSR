import { Injectable } from '@angular/core';
import { Isr } from '../models/isr';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IsrService {
  private url = 'api/Isr';

  constructor(private http: HttpClient) {}

  public getIsrs(): Observable<Isr[]> {
    return this.http.get<Isr[]>(`${this.url}`);
  }

  public updateIsrs(formData: FormData): Observable<Isr> {
    return this.http.put<Isr>(
      `${this.url}/update`, // Adjusted URL
      formData
    );
  }
  createIsrs(formData: FormData): Observable<Isr> {
    return this.http.post<Isr>(`${this.url}/upload`, formData);
  }
  public deleteIsrs(mvisit: Isr): Observable<Isr[]> {
    return this.http.delete<Isr[]>(`${this.url}/${mvisit.id}`);
  }

  getIsrCount(): Observable<number> {
    return this.http.get<number>(`${this.url}/count`);
  }
}
