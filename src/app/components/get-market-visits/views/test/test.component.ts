import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { Area } from '../../../../models/area';
import { MarketVisits } from '../../../../models/market-visits';
import { AreaService } from '../../../../services/area.service';
import { MarketVisitsService } from '../../../../services/market-visits.service';
import { TokenService } from '../../../../services/token.service';
import { AccountTypeService } from '../../../../services/account-type.service';
import { AccountType } from '../../../../models/accountType';
import { Isr } from '../../../../models/isr';
import { IsrService } from '../../../../services/isr.service';
import { Pod } from '../../../../models/pod';
import { PodService } from '../../../../services/pod.service';
import { Pap } from '../../../../models/pap';
import { PapService } from '../../../../services/pap.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SharedService } from '../../../../services/shared.service';
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
})
export class TestComponent {
  @Input() data?: MarketVisits;
  @Output() MarketVisitsUpdated = new EventEmitter<MarketVisits[]>();

  abfi_id: string | null = null;
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
    private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private marketVisitsService: MarketVisitsService,
    private _areaService: AreaService,
    private _accountTypeService: AccountTypeService,
    private _isrService: IsrService,
    private _podService: PodService,
    private _papService: PapService,
    private _formBuilder: FormBuilder,
    private tokenService: TokenService
  ) {
    // Initialize form group and form array for areas
    this.formGroup = this._formBuilder.group({
      area_id: this._formBuilder.array([]), // Should be initialized
      accountType_id: this._formBuilder.array([]), // Should be initialized
      isr_id: this._formBuilder.array([]), // Should be initialized
      pod_id: this._formBuilder.array([]), // Should be initialized
      pap_id: this._formBuilder.array([]), // Should be initialized
      user_id: new FormControl('', Validators.required),
      pap_others: new FormControl(''),
      pod_mpp_other: new FormControl(''),
      visit_competitorsCheck: new FormControl('', Validators.required),
      pod_canned_other: new FormControl(''),
      visit_averageOffTakePd: new FormControl('', Validators.required),
      visit_payolaContactNumber: new FormControl('', Validators.required),
      visit_payolaMerchandiser: new FormControl('', Validators.required),      
      visit_payolaSupervisor: new FormControl('', Validators.required),
      isr_needsOthers: new FormControl(''),
      isr_reqOthers: new FormControl(''),
      visit_salesPersonnel: new FormControl('', Validators.required),
      visit_accountType_others: new FormControl(''),
      visit_distributor: new FormControl('', Validators.required),
      visit_accountName: new FormControl('', Validators.required),
      visit_date: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    // Decode token and set user information
    this.tokenService.decodeTokenAndSetUser(); // Decode the token and set user information
    const user = this.tokenService.getUser();
    this.user_id = user?.id ?? null;
    this.abfi_id = user?.abfi_id??null;
    this.formGroup.patchValue({ user_id: this.user_id, abfi_id: this.abfi_id });
    this.cdr.detectChanges();

    // Fetch areas data
    this.getAreasData();
    this.getAccountTypeData();
    this.getIsrsData();
    this.getPodsData();
    this.getPapsData();
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

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched(); // Mark all fields as touched to trigger validation errors
  
      // Show snackbar for validation failure
      this.snackBar.open('Please fill in all required fields before submitting.', 'Close', {
        duration: 3000, // 3 seconds
      });
  
      return; // Exit the method to prevent form submission
    }
  
    const formData = new FormData();
  
    // Helper function to replace null or empty values with "N/A"
    const handleEmptyValue = (value: any): string => (value === null || value === '') ? 'N/A' : value;
  
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
    const accountName = handleEmptyValue(this.formGroup.get('visit_accountName')?.value);
    const distributor = handleEmptyValue(this.formGroup.get('visit_distributor')?.value);
    const salesPersonnel = handleEmptyValue(this.formGroup.get('visit_salesPersonnel')?.value);
    const accountTypeOthers = handleEmptyValue(this.formGroup.get('visit_accountType_others')?.value);
    const competitorsCheck = handleEmptyValue(this.formGroup.get('visit_competitorsCheck')?.value);
    const averageOffTakePd = handleEmptyValue(this.formGroup.get('visit_averageOffTakePd')?.value);
    const payolaMerchandiser = handleEmptyValue(this.formGroup.get('visit_payolaMerchandiser')?.value);
    const payolaContactNumber = handleEmptyValue(this.formGroup.get('visit_payolaMerchandiser')?.value);
    const payolaSupervisor = handleEmptyValue(this.formGroup.get('visit_payolaSupervisor')?.value);
    const isrNeedsOthers = handleEmptyValue(this.formGroup.get('isr_needsOthers')?.value);
    const isrReqOthers = handleEmptyValue(this.formGroup.get('isr_reqOthers')?.value);
    const pap_others = handleEmptyValue(this.formGroup.get('pap_others')?.value);
    const pod_canned_other = handleEmptyValue(this.formGroup.get('pod_canned_other')?.value);
    const pod_mpp_other = handleEmptyValue(this.formGroup.get('pod_mpp_other')?.value);
  
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
    formData.append('visit_payolaContactNumber', payolaContactNumber);
    formData.append('isr_needsOthers', isrNeedsOthers);
    formData.append('isr_reqOthers', isrReqOthers);
    formData.append('pap_others', pap_others);
    formData.append('pod_canned_other', pod_canned_other);
    formData.append('pod_mpp_other', pod_mpp_other);
  
    // Prepare a list of promises for fetching default images if needed
    const imagePromises: Promise<void>[] = [];
  
    // Append images if selected, otherwise append default images
    if (this.imageFileReq) {
      formData.append('isr_req_ImgPath', this.imageFileReq);
    } else {
      imagePromises.push(
        fetch('/no_img.jpg')
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch default req image.');
            }
            return response.blob();
          })
          .then(blob => {
            formData.append('isr_req_ImgPath', blob, 'no_img.jpg');
          })
          .catch(error => console.error('Error fetching default req image:', error))
      );
    }
  
    if (this.imageFileNeed) {
      formData.append('isr_needs_ImgPath', this.imageFileNeed);
    } else {
      imagePromises.push(
        fetch('/no_img.jpg')
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch default need image.');
            }
            return response.blob();
          })
          .then(blob => {
            formData.append('isr_needs_ImgPath', blob, 'no_img.jpg');
          })
          .catch(error => console.error('Error fetching default need image:', error))
      );
    }
  
    // Wait for any image fetch promises to resolve before submitting the form
    Promise.all(imagePromises)
      .then(() => {
        // Submit the form data to the server
        this.marketVisitsService.createMarketVisits(formData).subscribe(
          (response) => {
            console.log('Market visit submitted successfully', response);
        
            // Show success notification (for example, using MatSnackBar)
            const snackBarRef = this.snackBar.open('Market visit submitted successfully!', 'Close', {
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
            console.error('Error creating market visit:', error);
  
            // Show error notification
            this.snackBar.open('Failed to submit market visit. Please try again.', 'Close', {
              duration: 3000, // 3 seconds
            });
          }
        );
      })
      .catch((error) => {
        console.error('Error processing form submission:', error);
      });
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
