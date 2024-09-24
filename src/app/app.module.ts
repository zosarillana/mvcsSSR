import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AreaAddComponent } from './components/admin/views/master-data/area-add/area-add.component';
import { UpdateMarketVisitsComponent } from './components/update-market-visits/update-market-visits.component';
import { GetMarketVisitsComponent } from './components/get-market-visits/get-market-visits.component';
import { SidebarComponentComponent } from './components/sidebar-component/sidebar-component.component';
import { ModalCreateDialogComponent } from './components/get-market-visits/modal/modal-create-dialog/modal-create-dialog.component';
import { ModalEditDialogComponent } from './components/get-market-visits/modal/modal-edit-dialog/modal-edit-dialog.component';
import { ModalDeleteDialogComponent } from './components/get-market-visits/modal/modal-delete-dialog/modal-delete-dialog.component';
import { UserAddComponent } from './components/admin/views/user/user-add/user-add.component';
import { IsrAddComponent } from './components/admin/views/master-data/isr-add/isr-add.component';
import { PodAddComponent } from './components/admin/views/master-data/pod-add/pod-add.component';
import { ModalCreateUserDialogComponent } from './components/admin/views/user/user-add/modal/modal-create-user-dialog/modal-create-user-dialog.component';
import { ModalEditUserDialogComponent } from './components/admin/views/user/user-add/modal/modal-edit-user-dialog/modal-edit-user-dialog.component';
import { ModalDeleteUserDialogComponent } from './components/admin/views/user/user-add/modal/modal-delete-user-dialog/modal-delete-user-dialog.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { ModalViewUserDialogComponent } from './components/admin/views/user/user-add/modal/modal-view-user-dialog/modal-view-user-dialog.component';
import { ConfirmDialogComponent } from './components/admin/views/user/user-add/modal/modal-edit-user-dialog/confirm-dialog/confirm-dialog.component';
import { TokenService } from './services/token.service';
import { AuthService } from './auth/auth.service';
import { AddVisitsComponent } from './components/get-market-visits/views/add-visits/add-visits.component';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import { ModalCreateAreaComponent } from './components/admin/views/master-data/area-add/modal/modal-create-area/modal-create-area.component';
import { ModalViewAreaComponent } from './components/admin/views/master-data/area-add/modal/modal-view-area/modal-view-area.component';
import { ModalDeleteAreaComponent } from './components/admin/views/master-data/area-add/modal/modal-delete-area/modal-delete-area.component';
import { ModalEditAreaComponent } from './components/admin/views/master-data/area-add/modal/modal-edit-area/modal-edit-area.component';
import { ModalCreateIsrComponent } from './components/admin/views/master-data/isr-add/modal/modal-create-isr/modal-create-isr.component';
import { ModalEditIsrComponent } from './components/admin/views/master-data/isr-add/modal/modal-edit-isr/modal-edit-isr.component';
import { ModalViewIsrComponent } from './components/admin/views/master-data/isr-add/modal/modal-view-isr/modal-view-isr.component';
import { ModalDeleteIsrComponent } from './components/admin/views/master-data/isr-add/modal/modal-delete-isr/modal-delete-isr.component';
import { ModalCreatePodComponent } from './components/admin/views/master-data/pod-add/modal/modal-create-pod/modal-create-pod.component';
import { ModalEditPodComponent } from './components/admin/views/master-data/pod-add/modal/modal-edit-pod/modal-edit-pod.component';
import { ModalViewPodComponent } from './components/admin/views/master-data/pod-add/modal/modal-view-pod/modal-view-pod.component';
import { ModalDeletePodComponent } from './components/admin/views/master-data/pod-add/modal/modal-delete-pod/modal-delete-pod.component';
import { PapAddComponent } from './components/admin/views/master-data/pap-add/pap-add.component';
import { ModalCreatePapComponent } from './components/admin/views/master-data/pap-add/modal/modal-create-pap/modal-create-pap.component';
import { ModalEditPapComponent } from './components/admin/views/master-data/pap-add/modal/modal-edit-pap/modal-edit-pap.component';
import { ModalViewPapComponent } from './components/admin/views/master-data/pap-add/modal/modal-view-pap/modal-view-pap.component';
import { ModalDeletePapComponent } from './components/admin/views/master-data/pap-add/modal/modal-delete-pap/modal-delete-pap.component';
import { TestComponent } from './components/get-market-visits/views/test/test.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EditVisitsComponent } from './components/get-market-visits/views/edit-visits/edit-visits.component';
import { ViewVisitsComponent } from './components/get-market-visits/views/view-visits/view-visits.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { DatePipe } from '@angular/common';
import { ServerModule } from '@angular/platform-server';
import { AuthGuard } from './auth/auth.guard';
import { NoAuthGuard } from './auth/no-authguard.service';
import { ImagePreviewComponent } from './components/image-preview/image-preview.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { VisitChartComponent } from './components/charts/visit-chart/visit-chart.component';
import { StatusChartComponent } from './components/charts/status-chart/status-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
@NgModule({
  declarations: [
    AppComponent,
    UpdateMarketVisitsComponent,
    GetMarketVisitsComponent,
    SidebarComponentComponent,    
    ModalCreateDialogComponent,
    ModalEditDialogComponent,
    ModalDeleteDialogComponent,
    UserAddComponent,
    IsrAddComponent,
    PodAddComponent,
    ModalCreateUserDialogComponent,
    ModalEditUserDialogComponent,
    ModalDeleteUserDialogComponent,
    LoginComponent,
    ModalViewUserDialogComponent,
    ConfirmDialogComponent,
    AddVisitsComponent,
    LoadingScreenComponent,
    AreaAddComponent,
    ModalCreateAreaComponent,
    ModalViewAreaComponent,
    ModalDeleteAreaComponent,
    ModalEditAreaComponent,
    ModalCreateIsrComponent,
    ModalEditIsrComponent,
    ModalViewIsrComponent,
    ModalDeleteIsrComponent,
    ModalCreatePodComponent,
    ModalEditPodComponent,
    ModalViewPodComponent,
    ModalDeletePodComponent,
    PapAddComponent,
    ModalCreatePapComponent,
    ModalEditPapComponent,
    ModalViewPapComponent,
    ModalDeletePapComponent,
    TestComponent,
    EditVisitsComponent,
    ViewVisitsComponent,
    NotfoundComponent,
    ImagePreviewComponent,
    DashboardComponent,
    VisitChartComponent,
    StatusChartComponent,        
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatExpansionModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    // RouterModule,
    ServerModule,
    // AppServerModule,
    MatSnackBarModule,
    NgApexchartsModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthGuard,
    provideHttpClient(withFetch()),
    NoAuthGuard,
    DatePipe,
    TokenService,
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideClientHydration(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
