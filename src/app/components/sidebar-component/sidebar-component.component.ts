import { Component, OnInit, OnDestroy, ElementRef, Renderer2, inject } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { TokenService } from '../../services/token.service'; // Adjust path as needed
import { AuthService } from '../../auth/auth.service'; // Adjust path as needed
import { SharedService } from '../../services/shared.service'; // Adjust path as needed
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-sidebar-component',
  templateUrl: './sidebar-component.component.html',
  styleUrls: ['./sidebar-component.component.css'],
})
export class SidebarComponentComponent implements OnInit, OnDestroy {
  title = 'msvcREST';
  selectedContent = 'content1';
  isSidebarOpen = false;
  username: string | null = null;
  user: any = null;
  selectedId: string | null = null;

  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });
  fourthFormGroup = this._formBuilder.group({
    fourthCtrl: ['', Validators.required],
  });
  fifthFormGroup = this._formBuilder.group({
    fifthCtrl: ['', Validators.required],
  });
  isLinear = false;

  private clickListener!: () => void;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private authService: AuthService,
    private tokenService: TokenService,
    private sharedService: SharedService,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    // Bind the click event listener using Renderer2
    this.clickListener = this.renderer.listen(
      'document',
      'click',
      (event: MouseEvent) => {
        this.onDocumentClick(event);
      }
    );

    // Decode token and set user information
    this.tokenService.decodeTokenAndSetUser();
    this.user = this.tokenService.getUser();
    this.username = this.user ? this.user.sub : null;

    // console.log('User on init:', this.user); // Add this for debugging

    // Subscribe to content changes from SharedService
    this.sharedService.selectedContent$.subscribe((content) => {
      this.selectedContent = content;
      this.checkAccess(content); // Verify access when content changes
    });

    this.sharedService.selectedId$.subscribe((id) => {
      this.selectedId = id;
    });
  }

  ngOnDestroy(): void {
    // Remove the click event listener
    if (this.clickListener) {
      this.clickListener(); // Removes the event listener
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showContent(content: string, id?: string): void {
    this.sharedService.setSelectedContent(content);
    if (id) {
      this.sharedService.setSelectedId(id);
    }
    this.checkAccess(content); // Verify access when showing content
  }

  logout(): void {
    this.authService.logout();
    this.tokenService.decodeTokenAndSetUser(); // Clear user data on logout
    this.user = null;
    this.router.navigate(['/login']); // Redirect to login or another appropriate route
  }

  private checkAccess(content: string): void {
    // console.log('Checking access for content:', content);
    this.user = this.tokenService.getUser(); // Ensure user is updated
    // console.log('Current user role_id:', this.user?.role_id);

    if (
      (content === 'content2' && this.user?.role_id !== '1') ||
      (content === 'content3' && this.user?.role_id !== '1') ||
      (content === 'add-area' && this.user?.role_id !== '1') ||
      (content === 'pap-add' && this.user?.role_id !== '1') ||
      (content === 'content4' && this.user?.role_id !== '1')
    ) {
      this.router.navigate(['/404']); // Redirect to 404 page if access is denied
    }
  }

  private onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isSidebarOpen && !this.elRef.nativeElement.contains(target)) {
      this.isSidebarOpen = false;
    }
  }
}
