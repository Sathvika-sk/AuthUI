import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
/*import { PasswordToggleComponent } from '../password-toggle/password-toggle.component';*/
import { UserStoreService } from '../../services/user-store.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl : './login.component.css'
})
export class LoginComponent {
  
  loginForm!: FormGroup
  type: string="password";
  isText:boolean = false;
  eyeIcon:string='fa-eye-slash';
  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router:Router,
    private userStore: UserStoreService,
    private toastr:ToastrService
    ){ }

  ngOnInit(){
    this.loginForm=this.fb.group({
      email: ['',Validators.required],
      password: ['', Validators.required]
    }
    )

  }
  
  onSubmit(){
    if(this.loginForm.valid){
        console.log(this.loginForm.value)
        this.auth.login(this.loginForm.value).subscribe({
          next: (res) =>{
            
            this.loginForm.reset();
            
            this.auth.storeToken(res.token);
            const tokenPayload = this.auth.decodeToken();
            this.userStore.setNameForStore(tokenPayload.name);
            this.userStore.setRoleForStore(tokenPayload.role)
            
            this.toastr.success('Welcome!','You have successfully logged in');
            this.router.navigate(['dashboard'])
          },
          error: (err) => {
            console.error('error during login',err);
            this.toastr.error('Error','Something went wrong');
            
          },
          
        });

    }
    else{
      
      this.validateAllFormFields(this.loginForm);
      this.toastr.error('Error','Your form is not valid!');
            
    }
  }
  hideShowPass(){
    this.isText= !this.isText;
    this.isText ? this.eyeIcon ="fa-eye" : this.eyeIcon="fa-eye-slash";
    this.isText?this.type="text" :this.type= "password";

  }
  
  private validateAllFormFields(formGroup:FormGroup){
    Object.keys(formGroup.controls).forEach(field=>{
      const control = formGroup.get(field);
      if(control instanceof FormControl){
        control.markAsDirty({onlySelf:true})
      }else if(control instanceof FormGroup){
        this.validateAllFormFields(control)
      }

    })
  }
  

}
