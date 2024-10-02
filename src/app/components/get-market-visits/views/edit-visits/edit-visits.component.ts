import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MarketVisits } from '../../../../models/market-visits';
import { MarketVisitsService } from '../../../../services/market-visits.service';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountType } from '../../../../models/accountType';
import { Area } from '../../../../models/area';
import { Isr } from '../../../../models/isr';
import { Pap } from '../../../../models/pap';
import { Pod } from '../../../../models/pod';
import { AccountTypeService } from '../../../../services/account-type.service';
import { AreaService } from '../../../../services/area.service';
import { IsrService } from '../../../../services/isr.service';
import { PapService } from '../../../../services/pap.service';
import { PodService } from '../../../../services/pod.service';
import { SharedService } from '../../../../services/shared.service';
import { TokenService } from '../../../../services/token.service';
import { ConfirmDialogComponent } from '../../../admin/views/user/user-add/modal/modal-edit-user-dialog/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-visits',
  templateUrl: './edit-visits.component.html',
  styleUrls: ['./edit-visits.component.css'],
})
export class EditVisitsComponent implements OnInit {
  @Input() visitId: string | null = null;
  @Input() mvisit?: MarketVisits;
  @Output() MarketVisitsUpdated = new EventEmitter<MarketVisits[]>();

  role_id: string | null = null;
  user_id: string | null = null;
  imageFileReq: File | null = null;
  // imagePreviewReq: string | ArrayBuffer | null = null;
  imageFileNeed: File | null = null;
  // imagePreviewNeed: string | ArrayBuffer | null = null;

  username: string | null = null;
  user: any = null;
  areas: Area[] = [];
  paps: Pap[] = [];
  accountTypes: AccountType[] = [];
  isrs: Isr[] = [];
  isrRequirements: Isr[] = [];
  isrNeeds: Isr[] = [];
  pods: Pod[] = [];
  cannedPods: Pod[] = [];
  mppPods: Pod[] = [];
  // Define the FormGroup
  formGroup: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private marketVisitsService: MarketVisitsService,
    private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private _areaService: AreaService,
    private _accountTypeService: AccountTypeService,
    private _isrService: IsrService,
    private _podService: PodService,
    private _papService: PapService,
    private _formBuilder: FormBuilder,
    private tokenService: TokenService,
    private dialog: MatDialog
  ) {
    // Initialize formGroup with FormBuilder
    this.formGroup = this._formBuilder.group({
      area_id: this._formBuilder.array([]),
      accountType_id: this._formBuilder.array([]),
      isr_id: this._formBuilder.array([]),
      pod_id: this._formBuilder.array([]),
      pap_id: this._formBuilder.array([]),
      user_id: [''],
      visit_date: [''],
      visit_accountName: [''],
      visit_distributor: [''],
      visit_salesPersonnel: [''],
      visit_accountType_others: [''],
      visit_competitorsCheck: [''],
      visit_averageOffTakePd: [''],
      visit_payolaMerchandiser: [''],
      visit_payolaContactNumber: [''],
      visit_payolaSupervisor: [''],
      isr_needsOthers: [''],
      isr_reqOthers: [''],
      pap_others: [''],
      pod_canned_other: [''],
      pod_mpp_other: [''],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.visitId = params.get('id');
      if (this.visitId) {
        // Logic to handle the ID, e.g., load data based on the ID
        console.log('Visit ID:', this.visitId);
      }
    });
    // Decode token and set user information
    this.tokenService.decodeTokenAndSetUser();
    const user = this.tokenService.getUser();
    this.user_id = user?.id ?? null;
    this.role_id = user?.role_id ?? null;
    this.formGroup.patchValue({ user_id: this.user_id });
    this.cdr.detectChanges();

    // Fetch data
    this.getAreasData();
    this.getAccountTypeData();
    this.getIsrsData();
    this.getPodsData();
    this.getPapsData(); // Fetch paps data

    // Fetch visit data and set initial values
    if (this.visitId) {
      this.marketVisitsService.getVisitById(this.visitId).subscribe(
        (visit: MarketVisits) => {
          this.mvisit = visit;
          this.setInitialValues(); // Set initial values for areas
          this.setInitialPapValues(); // Set initial values for paps
          this.setInitialAccountValues();
          this.setInitialPodValues();
          this.setInitialIsrValues();
        },
        (error) => {
          console.error('Error fetching visit details:', error);
        }
      );
    }
  }

  //for getting of images
  private url = '/api/api/MarketVisits';
  public imageUrlBase = `${this.url}/image/`;
  getImageUrl(imageName: string | undefined): string {
    return imageName ? `${this.imageUrlBase}${imageName}` : '/no_img.jpg';
  }
  public imagePreviewNeed: string | ArrayBuffer | null = "/no_img.jpg";
  public imagePreviewReq: string | ArrayBuffer | null = "/no_img.jpg";

  setInitialValues(): void {
    // Get the selected area IDs as strings
    const selectedAreaIds = this.getMvisitAreaID()
      .split(', ')
      .map((id) => id.trim());
    const areaFormArray = this.formGroup.get('area_id') as FormArray;

    this.areas.forEach((area, index) => {
      const areaIdAsString = area.id.toString(); // Convert area_id to string

      if (selectedAreaIds.includes(areaIdAsString)) {
        areaFormArray.at(index).setValue(true);
      } else {
      }
    });
  }
  getMvisitAreaID(): string {
    return this.mvisit?.areas.map((area) => area.area_id).join(', ') || '';
  }

  //For Areas
  get areaFormArray(): FormArray {
    return this.formGroup.get('area_id') as FormArray;
  }

  getAreasData(): void {
    this._areaService.getAreas().subscribe((data: Area[]) => {
      this.areas = data;
      this.addAreaCheckboxes();
      // Call setInitialValues after areas and mvisit data are ready
      if (this.mvisit) {
        this.setInitialValues();
      }
    });
  }

  // Add a checkbox control for each area
  addAreaCheckboxes(): void {
    this.areas.forEach(() => {
      this.areaFormArray.push(new FormControl(false)); // Initialize each checkbox as unchecked
    });
  }
  getMvisitAccountId(): string {
    return (
      this.mvisit?.accountTypes
        .map((accountType) => accountType.accountType_id)
        .join(', ') || ''
    );
  }

  //For accountTypes
  get accountTypeFormArray(): FormArray {
    return this.formGroup.get('accountType_id') as FormArray;
  }

  getAccountTypeData(): void {
    this._accountTypeService
      .getAccountTypes()
      .subscribe((data: AccountType[]) => {
        this.accountTypes = data;
        this.addAccountTypeCheckboxes();
      });
  }

  // Add a checkbox control for each area
  addAccountTypeCheckboxes(): void {
    this.accountTypes.forEach(() => {
      this.accountTypeFormArray.push(new FormControl(false)); // Initialize each checkbox as unchecked
    });
  }

  setInitialAccountValues(): void {
    if (!this.mvisit?.accountTypes || !this.accountTypeFormArray) {
      return;
    }

    const selectedAccountId = this.getMvisitAccountId()
      .split(', ')
      .map((id) => id.trim());

    this.accountTypes.forEach((accountType, index) => {
      const accTypeasString = accountType.id?.toString();

      if (accTypeasString && selectedAccountId.includes(accTypeasString)) {
        this.accountTypeFormArray.at(index).setValue(true);
      } else {
      }
    });
  }

  //For Isrs
  getMvisitIsrId(): string {
    return this.mvisit?.isrs.map((isr) => isr.isr_id).join(', ') || '';
  }

  get isrsTypeFormArray(): FormArray {
    return this.formGroup.get('isr_id') as FormArray;
  }

  getIsrsData(): void {
    this._isrService.getIsrs().subscribe((data: Isr[]) => {
      this.isrs = data;
      this.filterIsrs();
      this.addIsrsCheckboxes();
    });
  }

  // Add a checkbox control for each area
  addIsrsCheckboxes(): void {
    this.clearFormArray(this.formGroup.get('isr_id') as FormArray);
    [...this.isrRequirements, ...this.isrNeeds].forEach((isr) => {
      (this.formGroup.get('isr_id') as FormArray).push(new FormControl(false));
    });
  }

  filterIsrs(): void {
    this.isrRequirements = this.isrs.filter(
      (isr) => isr.isr_type === 'REQUIREMENTS'
    );
    this.isrNeeds = this.isrs.filter((isr) => isr.isr_type === 'NEEDS');
  }

  setInitialIsrValues(): void {
    if (!this.isrs || !this.isrsTypeFormArray) {
      return;
    }

    // Assuming you have a way to get initial isr IDs
    const selectedIsrsIds = this.getMvisitIsrId()
      .split(', ')
      .map((id) => id.trim());

    this.isrs.forEach((isr, index) => {
      const isrIdasString = isr.id?.toString();

      if (isrIdasString && selectedIsrsIds.includes(isrIdasString)) {
        this.isrsTypeFormArray.at(index).setValue(true);
      } else {
      }
    });
  }
  //For Pods
  getMvisitPodId(): string {
    return this.mvisit?.pods.map((pod) => pod.pod_id).join(', ') || '';
  }

  get podsFormArray(): FormArray {
    return this.formGroup.get('pod_id') as FormArray;
  }

  getPodsData(): void {
    this._podService.getPods().subscribe((data: Pod[]) => {
      this.pods = data;
      this.filterPods();
      this.addPodsCheckboxes();
    });
  }

  addPodsCheckboxes(): void {
    this.clearFormArray(this.formGroup.get('pod_id') as FormArray);
    [...this.cannedPods, ...this.mppPods].forEach((pod) => {
      (this.formGroup.get('pod_id') as FormArray).push(new FormControl(false));
    });
  }

  filterPods(): void {
    this.cannedPods = this.pods.filter((pod) => pod.pod_type === 'CANNED');
    this.mppPods = this.pods.filter((pod) => pod.pod_type === 'MPP');
  }

  setInitialPodValues(): void {
    if (!this.pods || !this.podsFormArray) {
      console.error('Pods or podsFormArray is not available');
      return;
    }

    // Assuming you have a way to get initial pod IDs
    const selectedPodIds = this.getMvisitPodId()
      .split(', ')
      .map((id) => id.trim());

    this.pods.forEach((pod, index) => {
      const podIdAsString = pod.id?.toString();

      if (podIdAsString && selectedPodIds.includes(podIdAsString)) {
        this.podsFormArray.at(index).setValue(true);
      } else {
      }
    });
  }

  //For Paps
  getMvisitPapId(): string {
    return this.mvisit?.paps.map((pap) => pap.pap_id).join(', ') || '';
  }

  get papsFormArray(): FormArray {
    return this.formGroup.get('pap_id') as FormArray;
  }

  getPapsData(): void {
    this._papService.getPaps().subscribe((data: Pap[]) => {
      this.paps = data;
      this.addPapCheckBoxes();
    });
  }

  // Add a checkbox control for each area
  addPapCheckBoxes(): void {
    this.paps.forEach(() => {
      this.papsFormArray.push(new FormControl(false)); // Initialize each checkbox as unchecked
    });
  }

  setInitialPapValues(): void {
    if (!this.mvisit?.paps || !this.papsFormArray) {
      return;
    }

    const selectedPapIds = this.getMvisitPapId()
      .split(', ')
      .map((id) => id.trim());

    this.paps.forEach((pap, index) => {
      const papIdAsString = pap.id?.toString();

      if (papIdAsString && selectedPapIds.includes(papIdAsString)) {
        this.papsFormArray.at(index).setValue(true);
      } else {
      }
    });
  }

  // Add a checkbox control for each area
  clearFormArray(formArray: FormArray): void {
    while (formArray.length) {
      formArray.removeAt(0);
    }
  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit(); // Proceed with saving if the user confirmed
      }
    });
  }
  onSubmit(): void {
    // Ensure visitId is a number
    const visitId: number = Number(this.visitId);
    // Helper function to replace null or empty values with "N/A"
    const handleEmptyValue = (value: any): string =>
      value === null || value === '' ? 'N/A' : value;
    // Check if visitId is a valid number
    if (isNaN(visitId)) {
      console.error('Invalid visit ID');
      this.snackBar.open(
        'Invalid visit ID. Please check and try again.',
        'Close',
        {
          duration: 3000,
        }
      );
      return;
    }

    // Create FormData object and append necessary data
    const formData = new FormData();

    // Get selected IDs from the form group for areas, account types, etc.
    const selectedAreaIds = this.formGroup
      .get('area_id')
      ?.value.map((checked: boolean, index: number) =>
        checked && this.areas ? this.areas[index]?.id?.toString() : null
      )
      .filter((value: string | null) => value !== null) as string[];

    const selectedAccountTypeIds = this.formGroup
      .get('accountType_id')
      ?.value.map((checked: boolean, index: number) =>
        checked && this.accountTypes
          ? this.accountTypes[index]?.id?.toString()
          : null
      )
      .filter((value: string | null) => value !== null) as string[];

    const selectedIsrsIds = this.formGroup
      .get('isr_id')
      ?.value.map((checked: boolean, index: number) =>
        checked && this.isrs ? this.isrs[index]?.id?.toString() : null
      )
      .filter((value: string | null) => value !== null) as string[];

    const selectedPodIds = this.formGroup
      .get('pod_id')
      ?.value.map((checked: boolean, index: number) =>
        checked && this.pods ? this.pods[index]?.id?.toString() : null
      )
      .filter((value: string | null) => value !== null) as string[];

    const selectedPapIds = this.formGroup
      .get('pap_id')
      ?.value.map((checked: boolean, index: number) =>
        checked && this.paps ? this.paps[index]?.id?.toString() : null
      )
      .filter((value: string | null) => value !== null) as string[];

    // Get form field values (input boxes)
    const user_id = handleEmptyValue(this.formGroup.get('user_id')?.value);
    const visitDate = handleEmptyValue(this.formGroup.get('visit_date')?.value);
    const accountName = handleEmptyValue(
      this.formGroup.get('visit_accountName')?.value
    );
    const distributor = handleEmptyValue(
      this.formGroup.get('visit_distributor')?.value
    );
    const salesPersonnel = handleEmptyValue(
      this.formGroup.get('visit_salesPersonnel')?.value
    );
    const accountTypeOthers = handleEmptyValue(
      this.formGroup.get('visit_accountType_others')?.value
    );
    const competitorsCheck = handleEmptyValue(
      this.formGroup.get('visit_competitorsCheck')?.value
    );
    const averageOffTakePd = handleEmptyValue(
      this.formGroup.get('visit_averageOffTakePd')?.value
    );
    const payolaMerchandiser = handleEmptyValue(
      this.formGroup.get('visit_payolaMerchandiser')?.value
    );
    const payolaContactNumber = handleEmptyValue(
      this.formGroup.get('visit_payolaContactNumber')?.value
    );
    const payolaSupervisor = handleEmptyValue(
      this.formGroup.get('visit_payolaSupervisor')?.value
    );
    const isrNeedsOthers = handleEmptyValue(
      this.formGroup.get('isr_needsOthers')?.value
    );
    const isrReqOthers = handleEmptyValue(
      this.formGroup.get('isr_reqOthers')?.value
    );
    const pap_others = handleEmptyValue(
      this.formGroup.get('pap_others')?.value
    );
    const pod_canned_other = handleEmptyValue(
      this.formGroup.get('pod_canned_other')?.value
    );
    const pod_mpp_other = handleEmptyValue(
      this.formGroup.get('pod_mpp_other')?.value
    );

    // Convert arrays to strings that look like JSON arrays
    const formatArrayAsString = (arr: string[]): string =>
      `[${arr.map((id) => `"${id}"`).join(', ')}]`;

    // Append form data (checkbox selections and input field values)
    formData.append('area_id', formatArrayAsString(selectedAreaIds));
    formData.append(
      'accountType_id',
      formatArrayAsString(selectedAccountTypeIds)
    );
    formData.append('isr_id', formatArrayAsString(selectedIsrsIds));
    formData.append('pod_id', formatArrayAsString(selectedPodIds));
    formData.append('pap_id', formatArrayAsString(selectedPapIds));

    formData.append('user_id', user_id);
    formData.append('visit_date', visitDate);
    formData.append('visit_accountName', accountName);
    formData.append('visit_distributor', distributor);
    formData.append('visit_salesPersonnel', salesPersonnel);
    formData.append('visit_accountType_others', accountTypeOthers);
    formData.append('visit_competitorsCheck', competitorsCheck);
    formData.append('visit_averageOffTakePd', averageOffTakePd);
    formData.append('visit_payolaMerchandiser', payolaMerchandiser);
    formData.append('visit_payolaSupervisor', payolaSupervisor);
    formData.append('visit_payolaContactNumber', payolaContactNumber);
    formData.append('isr_needsOthers', isrNeedsOthers);
    formData.append('isr_reqOthers', isrReqOthers);
    formData.append('pap_others', pap_others);
    formData.append('pod_canned_other', pod_canned_other);
    formData.append('pod_mpp_other', pod_mpp_other);

    // Append images if selected
    if (this.imageFileReq) {
      formData.append('isr_req_ImgPath', this.imageFileReq);
    }
    if (this.imageFileNeed) {
      formData.append('isr_needs_ImgPath', this.imageFileNeed);
    }

    // Submit the form data to the server using the converted visitId
    this.marketVisitsService.updateMarketVisits(visitId, formData).subscribe(
      (response) => {
        console.log('Market visit updated successfully', response);
        const snackBarRef = this.snackBar.open('Market visit updated successfully!', 'Close', {
          duration: 3000, // 3 seconds
        });
        // Optionally, reset the form or navigate to another page
        this.formGroup.reset(); // Clear the form
        this.sharedService.setSelectedContent('content1');
    
        // Reload the page after the snackbar is dismissed
        snackBarRef.afterDismissed().subscribe(() => {
          window.location.reload();
        });
      },
      (error) => {
        console.error('Error updating market visit:', error);
        this.snackBar.open(
          'Failed to update market visit. Please try again.',
          'Close',
          {
            duration: 3000, // 3 seconds
          }
        );
      }
    );
  }

  onImageSelect(event: Event, type: 'req' | 'need'): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'req') {
          this.imageFileReq = file;
          this.imagePreviewReq = reader.result;
          this.formGroup.patchValue({ isr_req_ImgPath: file.name });
        } else {
          this.imageFileNeed = file;
          this.imagePreviewNeed = reader.result;
          this.formGroup.patchValue({ isr_needs_ImgPath: file.name });
        }
        this.cdr.markForCheck(); // Ensure change detection is triggered
      };
      reader.readAsDataURL(file);
    }
  }
}
