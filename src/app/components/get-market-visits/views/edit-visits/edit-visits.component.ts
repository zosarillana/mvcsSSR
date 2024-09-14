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
@Component({
  selector: 'app-edit-visits',
  templateUrl: './edit-visits.component.html',
  styleUrls: ['./edit-visits.component.css'],
})
export class EditVisitsComponent implements OnInit {
  @Input() visitId: string | null = null;
  @Input() mvisit?: MarketVisits;
  @Output() MarketVisitsUpdated = new EventEmitter<MarketVisits[]>();

  user_id: string | null = null;
  imageFileReq: File | null = null;
  imagePreviewReq: string | ArrayBuffer | null = null;
  imageFileNeed: File | null = null;
  imagePreviewNeed: string | ArrayBuffer | null = null;

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
      visit_payolaSupervisor: [''],
      isr_needsOthers: [''],
      isr_reqOthers: [''],
      pap_others: [''],
      pod_canned_other: [''],
      pod_mpp_other: [''],
    });
  }

  ngOnInit(): void {
    // Decode token and set user information
    this.tokenService.decodeTokenAndSetUser(); // Decode the token and set user information
    const user = this.tokenService.getUser();
    this.user_id = user?.id ?? null;
    this.formGroup.patchValue({ user_id: this.user_id });
    this.cdr.detectChanges();
    // Fetch areas data
    this.getAreasData();
    this.getAccountTypeData();
    this.getIsrsData();
    this.getPodsData();
    this.getPapsData();
    if (this.visitId) {
      // Fetch data based on visitId
      this.marketVisitsService.getVisitById(this.visitId).subscribe(
        (visit: MarketVisits) => {
          this.mvisit = visit;
        },
        (error) => {
          console.error('Error fetching visit details:', error);
        }
      );
    }
  }

  //For Areas
  get areaFormArray(): FormArray {
    return this.formGroup.get('area_id') as FormArray;
  }

  getAreasData(): void {
    this._areaService.getAreas().subscribe((data: Area[]) => {
      this.areas = data;
      this.addAreaCheckboxes();
    });
  }

  // Add a checkbox control for each area
  addAreaCheckboxes(): void {
    this.areas.forEach(() => {
      this.areaFormArray.push(new FormControl(false)); // Initialize each checkbox as unchecked
    });
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

  //For accountTypes
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

  //For Pods
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

  // Add a checkbox control for each area
  clearFormArray(formArray: FormArray): void {
    while (formArray.length) {
      formArray.removeAt(0);
    }
  }

  //For Areas
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

  filterIsrs(): void {
    this.isrRequirements = this.isrs.filter(
      (isr) => isr.isr_type === 'REQUIREMENTS'
    );
    this.isrNeeds = this.isrs.filter((isr) => isr.isr_type === 'NEEDS');
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
  
    // Check if visitId is a valid number
    if (isNaN(visitId)) {
      console.error('Invalid visit ID');
      this.snackBar.open('Invalid visit ID. Please check and try again.', 'Close', {
        duration: 3000,
      });
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
    const user_id = this.formGroup.get('user_id')?.value;
    const visitDate = this.formGroup.get('visit_date')?.value;
    const accountName = this.formGroup.get('visit_accountName')?.value;
    const distributor = this.formGroup.get('visit_distributor')?.value;
    const salesPersonnel = this.formGroup.get('visit_salesPersonnel')?.value;
    const accountTypeOthers = this.formGroup.get('visit_accountType_others')?.value;
    const competitorsCheck = this.formGroup.get('visit_competitorsCheck')?.value;
    const averageOffTakePd = this.formGroup.get('visit_averageOffTakePd')?.value;
    const payolaMerchandiser = this.formGroup.get('visit_payolaMerchandiser')?.value;
    const payolaSupervisor = this.formGroup.get('visit_payolaSupervisor')?.value;
    const isrNeedsOthers = this.formGroup.get('isr_needsOthers')?.value;
    const isrReqOthers = this.formGroup.get('isr_reqOthers')?.value;
    const pap_others = this.formGroup.get('pap_others')?.value;
    const pod_canned_other = this.formGroup.get('pod_canned_other')?.value;
    const pod_mpp_other = this.formGroup.get('pod_mpp_other')?.value;
  
    console.log('Selected Area IDs:', selectedAreaIds);
    console.log('Selected Account Type IDs:', selectedAccountTypeIds);
    console.log('Selected ISR IDs:', selectedIsrsIds);
    console.log('Selected POD IDs:', selectedPodIds);
    console.log('Selected PAP IDs:', selectedPapIds);
  
    // Convert arrays to strings that look like JSON arrays
    const formatArrayAsString = (arr: string[]): string =>
      `[${arr.map((id) => `"${id}"`).join(', ')}]`;
  
    // Append form data (checkbox selections and input field values)
    formData.append('area_id', formatArrayAsString(selectedAreaIds));
    formData.append('accountType_id', formatArrayAsString(selectedAccountTypeIds));
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
        this.snackBar.open('Market visit updated successfully!', 'Close', {
          duration: 3000, // 3 seconds
        });
        this.formGroup.reset(); // Clear the form
        this.sharedService.setSelectedContent('content1');
      },
      (error) => {
        console.error('Error updating market visit:', error);
        this.snackBar.open('Failed to update market visit. Please try again.', 'Close', {
          duration: 3000, // 3 seconds
        });
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
