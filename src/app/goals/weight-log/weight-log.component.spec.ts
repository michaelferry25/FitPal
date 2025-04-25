import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightLogComponent } from './weight-log.component';

describe('WeightLogComponent', () => {
  let component: WeightLogComponent;
  let fixture: ComponentFixture<WeightLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeightLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeightLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
