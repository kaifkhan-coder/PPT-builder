export interface SlideData {
  title: string;
  content: string[]; // Array of bullet points
  layout?: 'title_only' | 'content_only' | 'full';
  imageUrl?: string;
}

export type PresentationData = SlideData[];

export type AppState = 'idle' | 'prompting' | 'uploading' | 'loading' | 'presenting' | 'error' | 'url_prompting';