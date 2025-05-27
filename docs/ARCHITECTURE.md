
# Architecture Diagram
## Hashim - AI-Powered Personal Fitness Trainer

### System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Frontend]
        PWA[Progressive Web App]
        Camera[Device Camera]
    end
    
    subgraph "API Gateway"
        Router[React Router]
        Auth[Auth Guard]
        Query[TanStack Query]
    end
    
    subgraph "Supabase Backend"
        AuthS[Supabase Auth]
        DB[(PostgreSQL)]
        Storage[Supabase Storage]
        RT[Real-time Engine]
        EdgeFn[Edge Functions]
    end
    
    subgraph "AI Services"
        OpenAI[OpenAI GPT-4]
        AWS[AWS Rekognition]
    end
    
    subgraph "External APIs"
        Nutrition[Nutrition APIs]
        Exercise[Exercise APIs]
    end
    
    UI --> Router
    Router --> Auth
    Auth --> Query
    Query --> AuthS
    Query --> DB
    Query --> Storage
    Query --> RT
    
    Camera --> Storage
    Storage --> EdgeFn
    EdgeFn --> OpenAI
    EdgeFn --> AWS
    EdgeFn --> DB
    
    OpenAI --> Nutrition
    OpenAI --> Exercise
    
    DB --> RT
    RT --> UI
    
    style UI fill:#e1f5fe
    style DB fill:#f3e5f5
    style OpenAI fill:#fff3e0
    style AWS fill:#e8f5e8
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase
    participant E as Edge Function
    participant AI as OpenAI/AWS
    
    Note over U,AI: Workout Plan Generation
    U->>F: Complete Assessment
    F->>S: Store Assessment Data
    S->>E: Trigger Analysis
    E->>AI: Generate Workout Plan
    AI->>E: Return Plan Data
    E->>S: Store Workout Plan
    S->>F: Update UI
    F->>U: Display Personalized Plan
    
    Note over U,AI: Meal Photo Analysis
    U->>F: Capture Meal Photo
    F->>S: Upload Image
    S->>E: Process Image
    E->>AI: Analyze Food Items
    AI->>E: Return Nutrition Data
    E->>S: Store Meal Log
    S->>F: Real-time Update
    F->>U: Show Analysis Results
    
    Note over U,AI: AI Chat Interaction
    U->>F: Send Chat Message
    F->>S: Store Message
    S->>E: Process with Context
    E->>AI: Generate Response
    AI->>E: Return AI Response
    E->>S: Store Response
    S->>F: Stream Response
    F->>U: Display AI Message
```

### Component Architecture

```mermaid
graph LR
    subgraph "Pages"
        Login[Login]
        Dashboard[Dashboard]
        Assessment[Assessment]
        Profile[Profile]
        Workouts[Workouts]
        Progress[Progress]
    end
    
    subgraph "Components"
        MealCapture[MealCaptureCard]
        WorkoutCard[WorkoutCard]
        Chat[ChatInterface]
        Stats[StatsCard]
        Forms[AssessmentForm]
    end
    
    subgraph "Hooks"
        Auth[useAuth]
        Query[useQuery]
        Mutation[useMutation]
    end
    
    subgraph "Services"
        WorkoutSvc[WorkoutService]
        NutritionSvc[NutritionService]
        ChatSvc[ChatService]
        AssessmentSvc[AssessmentService]
    end
    
    subgraph "Context"
        UserCtx[UserContext]
        ThemeCtx[ThemeContext]
    end
    
    Pages --> Components
    Components --> Hooks
    Hooks --> Services
    Components --> Context
    
    style Pages fill:#e3f2fd
    style Components fill:#f1f8e9
    style Hooks fill:#fff8e1
    style Services fill:#fce4ec
    style Context fill:#f3e5f5
```

### Database Schema Relationships

```mermaid
erDiagram
    users ||--|| profiles : has
    users ||--o{ workout_plans : creates
    users ||--o{ workout_logs : completes
    users ||--o{ nutrition_logs : tracks
    users ||--o{ chat_messages : sends
    users ||--o{ progress_metrics : records
    
    profiles ||--o{ assessment_data : completes
    
    workout_plans ||--o{ workout_exercises : contains
    workout_plans ||--o{ workout_schedule : scheduled
    
    workout_schedule ||--o| workout_logs : generates
    workout_logs ||--o{ exercise_logs : contains
    
    nutrition_logs ||--o{ meal_logs : contains
    nutrition_plans ||--o{ meal_plans : includes
    
    users {
        uuid id PK
        string email
        timestamp created_at
    }
    
    profiles {
        uuid id PK
        string name
        int age
        string gender
        float height
        float weight
        string fitness_goal
    }
    
    workout_plans {
        uuid id PK
        uuid user_id FK
        string title
        text description
        boolean ai_generated
    }
    
    nutrition_logs {
        uuid id PK
        uuid user_id FK
        date log_date
        int total_calories
        int total_protein_g
    }
```
