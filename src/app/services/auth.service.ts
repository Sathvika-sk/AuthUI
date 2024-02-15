import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {User} from '../models/user.model'
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl:string ="https://localhost:7056/api/User/"
  private userPayload:any;
  private userIdSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router) { 
    //this.userPayload =this.decodeToken();
  }

  signUp(UserObj:any){
    return this.http.post<any>(`${this.baseUrl}register`,UserObj)

  }
  login(loginObj:any):Observable<any>{
    return this.http.post<any>(`${this.baseUrl}authenticate`,loginObj)
    .pipe(
      tap(response =>{
        if(response && response.userId){
          this.userIdSubject.next(response.userId);
        }
      })
    );

  }
  getUser(email:string):Observable<User>{
    return this.http.get<User>(`${this.baseUrl}${email}`)

  }
  updateUser(id:number,userObj:User):Observable<User>{
    return this.http.put<User>(`${this.baseUrl}${id}`,userObj)

  }
  getUserId(): Observable<number | null> {
    return this.userIdSubject.asObservable();
  }
  deleteUser(id:number): Observable<any>{
    return this.http.delete<any>(this.baseUrl+id);
  }

  storeToken(tokenValue: string){
    localStorage.setItem('token',tokenValue)
  }

  getToken(){
    return localStorage.getItem('token')
  }

  isloggedIn():boolean{
    return !!localStorage.getItem('token')
  }

  signOut(){
    localStorage.clear();
    this.router.navigate(['login'])
    
  }
  getfullNameFromToken(){
    if(this.userPayload){
      return this.userPayload.name;
    }
  }
  getRoleFromToken(){
    if(this.userPayload){
      return this.userPayload.role;
    }
  }
  
  private jwtHelper: JwtHelperService = new JwtHelperService();
  
  decodeToken() {
    const token = this.getToken();
    console.log('Token:', token);
  
    if (!token) {
      console.error('No token available.');
      return null;
    }

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      console.log('Decoded Token:', decodedToken);
      return decodedToken;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
  
  
    // Assuming you have a method like this to retrieve the token
    
  }
  /*decodeToken(){
    const jwtHelper = new JwtHelperService();
    const token= this.getToken()!;
    console.log(jwtHelper.decodeToken(token))

    return jwtHelper.decodeToken(token)
  }
  */


