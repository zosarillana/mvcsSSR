import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MarketVisits } from '../../../../models/market-visits';
import { MarketVisitsService } from '../../../../services/market-visits.service';
import { ActivatedRoute } from '@angular/router';
import { Area } from '../../../../models/area';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AccountType } from '../../../../models/accountType';
import { Isr } from '../../../../models/isr';
import { Pap } from '../../../../models/pap';
import { Pod } from '../../../../models/pod';
import { AccountTypeService } from '../../../../services/account-type.service';
import { AreaService } from '../../../../services/area.service';
import { IsrService } from '../../../../services/isr.service';
import { PapService } from '../../../../services/pap.service';
import { PodService } from '../../../../services/pod.service';
import { TokenService } from '../../../../services/token.service';

@Component({
  selector: 'app-view-visits',
  templateUrl: './view-visits.component.html',
  styleUrl: './view-visits.component.css',
})
export class ViewVisitsComponent {
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
    this.route.paramMap.subscribe((params) => {
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
  public imagePreviewNeed: string | null = null;
  public isPreviewVisible: boolean = false;

  // Function to handle image preview modal
  showImagePreview(imageSrc: string): void {
    this.imagePreviewNeed = imageSrc;
    this.isPreviewVisible = true;
  }

  // Function to close the image preview
  closeImagePreview(): void {
    this.isPreviewVisible = false;
    this.imagePreviewNeed = null;
  }

  // For getting images
  private url = '/api/api/MarketVisits';
  public imageUrlBase = `${this.url}/image/`;

  getImageUrl(imageName: string | undefined): string {
    return imageName ? `${this.imageUrlBase}${imageName}` : '/no_img.jpg';
  }

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

  getFormattedVisitDate(): string {
    if (this.mvisit && this.mvisit.visit_date) {
      const date = new Date(this.mvisit.visit_date);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString('en-US', options).replace(',', '');
    }
    return 'No Date';
  }

  getAllAreaNames(): string {
    return (
      this.mvisit?.areas.map((area) => area.area_name).join(', ') || 'No Areas'
    );
  }

  getAllAccountType(): string {
    return (
      this.mvisit?.accountTypes
        .map((accountTypes) => accountTypes.accountType_name)
        .join(', ') || 'No Account Types'
    );
  }

  getAllIsrs(type: 'NEEDS' | 'REQUIREMENTS'): string {
    return (
      this.mvisit?.isrs
        .filter((isr) => isr.isr_type === type)
        .map((isr) => isr.isr_name)
        .join(', ') || 'No In store requirement'
    );
  }

  getAllPods(type: 'CANNED' | 'MPP'): string {
    return (
      this.mvisit?.pods
        .filter((pod) => pod.pod_type === type)
        .map((pod) => pod.pod_name)
        .join(', ') || 'No Poduct on Display'
    );
  }

  getAllPaps(): string {
    return (
      this.mvisit?.paps.map((paps) => paps.pap_name).join(', ') || 'No Paps'
    );
  }
}
