import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountComponent } from './account/account.component';
import { SettingsComponent } from './settings/settings.component';
import { RecipeComponent } from './recipe/recipe.component';
import { RecipeDetailsComponent } from './recipe-details/recipe-details.component';
import { GoalsComponent } from './goals/goals.component';
import { MealLogComponent } from './meal-log/meal-log.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ProgressComponent } from './goals/progress/progress.component';
import { WeightLogComponent } from './goals/weight-log/weight-log.component';
import { AboutComponent } from './info/about/about.component';
import { TermsComponent } from './info/terms/terms.component';
import { PrivacyComponent } from './info/privacy/privacy.component';
import { ContactComponent } from './info/contact/contact.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'recipes', component: RecipeComponent, canActivate: [AuthGuard] },
  { path: 'goals', component: GoalsComponent, canActivate: [AuthGuard] },
  { path: 'goals/progress', component: ProgressComponent, canActivate: [AuthGuard] },
  { path: 'meal-log', component: MealLogComponent, canActivate: [AuthGuard] },
  { path: 'recipes/:id', component: RecipeDetailsComponent, canActivate: [AuthGuard] },
  { path: 'goals/weight-log', component: WeightLogComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'contact', component: ContactComponent },
];
