import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {ApiService} from  '../../services/api.service';
import { UserStoreService } from '../../services/user-store.service';
import { ActivatedRoute,Router } from '@angular/router';
import { User } from '../../models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userDetails!: FormGroup;
  userId:number|null=null;
    
  users:User[] =[];

  public role!:string;
  public name:string="";
    constructor(
      private api: ApiService, 
      private route: ActivatedRoute,
      private auth: AuthService, 
      private userStore: UserStoreService,
      private router:Router,
      private fb:FormBuilder,
      private toastr:ToastrService){ }
    ngOnInit():void {
      this.userDetails = this.fb.group({
        id:[0],
        name: [''],
        email: [''],
        phone: [0],
        salary: [0],
        department: [''],
        password: [''] // Add other validations if needed
      });
      this.auth.getUserId().subscribe(id => {
        this.userId = id;
      });

this.api.getUsers()
.subscribe({
  next:(users)=>{
    this.users=users;
  },
  error:(response)=>{
  this.toastr.error("this is an error")
  }})


      this.route.paramMap.subscribe({
        next:(params) =>{
          const email = params.get('email');
          
          if(email) {
            this.auth.getUser(email)
            .subscribe({
              next:(response) => {
                this.auth.getUser(email);
                // Optionally, you can update the local data or perform any other action.
              }
            });
            }  
        }
      })
      /*this.api.getUsers()
      .subscribe(res=>{
        this.users=res;
      });*/
      

      this.userStore.getNameFromStore()
      .subscribe(val=>{
        const nameFromToken = this.auth.getfullNameFromToken();
        this.name = val|| nameFromToken
        
      })
      this.userStore.getRoleFromStore()
      .subscribe(val=>{
        const roleFromToken=this.auth.getRoleFromToken();
        this.role= val|| roleFromToken;
      })
    
    }

    logout(){
      this.auth.signOut();
    }
    updateUser() {
    if(this.userId !== null){
      console.log(this.userId);
      console.log(this.userDetails.value)
      this.auth.updateUser(this.userId, this.userDetails.value)
      .subscribe({
        next: (response) => {
        this.router.navigate(['dashboard']);
          // Optionally, you can update the local data or perform any other action.
        },
        error:(err)=> {
          console.error('error during login',err);
          alert('Error here');
          
        },
        }
      );
    } else{
      console.error('id is null.');
    }
    }
    
      deleteUser(id:number){

        this.auth.deleteUser(id)
        .subscribe({
          next:(Response)=>
          this.router.navigate(['dashboard'])
        })
      }

}
