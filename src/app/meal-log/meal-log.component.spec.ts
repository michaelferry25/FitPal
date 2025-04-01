import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealLogComponent } from './meal-log.component';

describe('MealLogComponent', () => {
  let component: MealLogComponent;
  let fixture: ComponentFixture<MealLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
