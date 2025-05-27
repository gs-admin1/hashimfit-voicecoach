
# User Flow Diagrams
## Hashim - AI-Powered Personal Fitness Trainer

### User Onboarding Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> Auth{Authenticated?}
    Auth -->|No| Login[Login/Register Screen]
    Auth -->|Yes| Profile{Profile Complete?}
    
    Login --> Register[Create Account]
    Login --> SignIn[Sign In]
    Register --> Assessment[Fitness Assessment]
    SignIn --> Profile
    
    Profile -->|No| Assessment
    Profile -->|Yes| Dashboard[Main Dashboard]
    
    Assessment --> Questions[Assessment Questions]
    Questions --> AI[AI Analysis]
    AI --> Plans[Generate Workout Plans]
    Plans --> Welcome[Welcome & Tutorial]
    Welcome --> Dashboard
    
    Dashboard --> End([Ready to Use App])
    
    style Start fill:#e8f5e8
    style End fill:#e8f5e8
    style Assessment fill:#fff3e0
    style AI fill:#f3e5f5
```

### Daily Workout Flow

```mermaid
flowchart TD
    Dashboard[Dashboard] --> Schedule{Workout Scheduled?}
    Schedule -->|Yes| ViewWorkout[View Today's Workout]
    Schedule -->|No| AddWorkout[Add Workout]
    
    AddWorkout --> SelectPlan[Select Workout Plan]
    SelectPlan --> ScheduleIt[Schedule for Today]
    ScheduleIt --> ViewWorkout
    
    ViewWorkout --> StartWorkout[Start Workout]
    StartWorkout --> Exercise[Exercise Tracking]
    
    Exercise --> Complete{Exercise Complete?}
    Complete -->|No| LogSet[Log Set/Reps]
    LogSet --> Exercise
    Complete -->|Yes| NextEx{More Exercises?}
    
    NextEx -->|Yes| Exercise
    NextEx -->|No| WorkoutComplete[Workout Complete]
    
    WorkoutComplete --> Summary[View Summary]
    Summary --> Share{Share Progress?}
    Share -->|Yes| ShareWorkout[Share Achievement]
    Share -->|No| Dashboard
    ShareWorkout --> Dashboard
    
    style Dashboard fill:#e3f2fd
    style WorkoutComplete fill:#e8f5e8
    style Summary fill:#fff8e1
```

### Meal Logging Flow

```mermaid
flowchart TD
    Dashboard[Dashboard] --> MealCard[Meal Capture Card]
    MealCard --> Method{Capture Method}
    
    Method -->|Camera| OpenCamera[Open Camera]
    Method -->|Gallery| SelectFile[Select from Gallery]
    
    OpenCamera --> TakePhoto[Take Photo]
    SelectFile --> Preview[Image Preview]
    TakePhoto --> Preview
    
    Preview --> MealType[Select Meal Type]
    MealType --> Analyze[Analyze Meal]
    
    Analyze --> Processing[AI Processing]
    Processing --> Results{Analysis Success?}
    
    Results -->|Yes| ShowResults[Show Nutrition Data]
    Results -->|No| Error[Show Error Message]
    
    ShowResults --> Confirm{Confirm Results?}
    Confirm -->|Yes| SaveMeal[Save to Log]
    Confirm -->|No| Retry[Try Again]
    
    SaveMeal --> Updated[Update Daily Nutrition]
    Updated --> Dashboard
    
    Error --> Retry
    Retry --> Method
    
    style Dashboard fill:#e3f2fd
    style Processing fill:#fff3e0
    style ShowResults fill:#e8f5e8
    style Error fill:#ffebee
```

### AI Chat Flow

```mermaid
flowchart TD
    Start([User Opens Chat]) --> ChatInterface[Chat Interface]
    ChatInterface --> Message[Type Message]
    
    Message --> Send[Send Message]
    Send --> Context[Add User Context]
    Context --> AI[Process with AI]
    
    AI --> Response{AI Response Ready?}
    Response -->|Yes| Display[Display Response]
    Response -->|No| Loading[Show Loading]
    Loading --> Response
    
    Display --> Action{User Action Needed?}
    Action -->|Yes| ActionPrompt[Show Action Options]
    Action -->|No| Continue[Continue Chat]
    
    ActionPrompt --> Execute{Execute Action?}
    Execute -->|Yes| PerformAction[Perform Action]
    Execute -->|No| Continue
    
    PerformAction --> Continue
    Continue --> More{More Questions?}
    More -->|Yes| Message
    More -->|No| End([End Chat])
    
    style Start fill:#e8f5e8
    style AI fill:#f3e5f5
    style ActionPrompt fill:#fff3e0
    style End fill:#e8f5e8
```

### Error Handling Flow

```mermaid
flowchart TD
    Error([Error Occurs]) --> Type{Error Type}
    
    Type -->|Network| NetworkError[Network Error]
    Type -->|Auth| AuthError[Authentication Error]
    Type -->|Validation| ValidationError[Validation Error]
    Type -->|AI Service| AIError[AI Service Error]
    
    NetworkError --> Retry{Auto Retry?}
    Retry -->|Yes| RetryAction[Retry Request]
    Retry -->|No| Offline[Show Offline Mode]
    
    AuthError --> Logout[Force Logout]
    Logout --> Login[Redirect to Login]
    
    ValidationError --> ShowError[Show Error Message]
    ShowError --> UserAction[User Corrects Input]
    
    AIError --> Fallback{Fallback Available?}
    Fallback -->|Yes| UseFallback[Use Fallback Service]
    Fallback -->|No| GracefulFail[Graceful Degradation]
    
    RetryAction --> Success{Success?}
    Success -->|Yes| Continue[Continue Normal Flow]
    Success -->|No| Offline
    
    UseFallback --> Continue
    GracefulFail --> ShowError
    UserAction --> Continue
    Offline --> Sync[Sync When Online]
    
    style Error fill:#ffebee
    style Continue fill:#e8f5e8
    style Offline fill:#fff3e0
```

### Key User Journeys Summary

#### New User Journey
1. **Discovery**: User finds app through marketing or referral
2. **Registration**: Creates account with email/password
3. **Assessment**: Completes comprehensive fitness questionnaire
4. **Personalization**: AI generates customized workout plans
5. **First Workout**: Guided through first workout experience
6. **Habit Formation**: Daily engagement with workouts and nutrition

#### Daily Active User Journey
1. **Check-in**: Opens app to view daily dashboard
2. **Workout**: Completes scheduled workout with progress tracking
3. **Nutrition**: Logs meals through photo analysis
4. **Chat**: Asks AI assistant for guidance or motivation
5. **Progress**: Reviews weekly progress and achievements

#### Re-engagement Journey
1. **Notification**: Receives reminder about missed workout
2. **Return**: Opens app to catch up on activities
3. **Motivation**: AI provides encouraging message and adjusted plan
4. **Restart**: Resumes workout routine with modified schedule
5. **Consistency**: Maintains regular usage pattern
