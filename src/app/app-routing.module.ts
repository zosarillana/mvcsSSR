import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard'; // Adjust path as needed
import { NoAuthGuard } from './auth/no-authguard.service';
import { LoginComponent } from './components/authentication/login/login.component'; // Adjust path as needed
import { SidebarComponentComponent } from './components/sidebar-component/sidebar-component.component'; // Adjust path as needed
import { NotfoundComponent } from './components/notfound/notfound.component';
import { UserAddComponent } from './components/admin/views/user/user-add/user-add.component';
import { GetMarketVisitsComponent } from './components/get-market-visits/get-market-visits.component'; // Adjust as needed
import { AreaAddComponent } from './components/admin/views/master-data/area-add/area-add.component';
import { PodAddComponent } from './components/admin/views/master-data/pod-add/pod-add.component';
import { IsrAddComponent } from './components/admin/views/master-data/isr-add/isr-add.component';
import { PapAddComponent } from './components/admin/views/master-data/pap-add/pap-add.component';
import { RoleGuard } from './auth/role.guard';
import { EditVisitsComponent } from './components/get-market-visits/views/edit-visits/edit-visits.component';
import { ViewVisitsComponent } from './components/get-market-visits/views/view-visits/view-visits.component';
import { TestComponent } from './components/get-market-visits/views/test/test.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { roleAdminGuard } from './auth/role-admin.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: SidebarComponentComponent, // Sidebar stays visible here
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent }, // Default view
      { path: 'users', component: UserAddComponent, canActivate: [RoleGuard] }, // Users view
      { path: 'areas', component: AreaAddComponent, canActivate: [RoleGuard] }, // Areas view
      { path: 'isrs', component: IsrAddComponent, canActivate: [RoleGuard] }, // Isrs view
      { path: 'pods', component: PodAddComponent, canActivate: [RoleGuard] }, // Pods view
      { path: 'paps', component: PapAddComponent, canActivate: [RoleGuard] }, // Paps view
      { path: 'visits', component: GetMarketVisitsComponent }, // Create visits view
      { path: 'visits/create', component: TestComponent }, // Create visits view
      { path: 'visits/edit/:id', component: EditVisitsComponent, canActivate: [roleAdminGuard]}, // Edit visits view
      { path: 'visits/view/:id', component: ViewVisitsComponent }, // Edit visits view
    ]
  },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: '404', component: NotfoundComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/404' }, // Wildcard route for 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
