import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Area } from '../models/area';

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private url = '/api/api/Area';  

  constructor(private http: HttpClient) {}

  public getAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.url}`);
  }

  public updateAreas(mvisit: Area): Observable<Area> {
    return this.http.put<Area>(
      `${this.url}`,
      mvisit
    );
  }

  public createAreas(mvisit: Area): Observable<Area> {
    return this.http.post<Area>(
      `${this.url}`,
      mvisit
    );
  }

  public deleteAreas(mvisit: Area): Observable<Area[]> {
    return this.http.delete<Area[]>(
      `${this.url}/${mvisit.id}`
    );
  }

  public getAreaCount(): Observable<number> {
    return this.http.get<number>(`${this.url}/count`);
  }
}