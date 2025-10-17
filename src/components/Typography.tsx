import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

// Display - For hero sections and major headings
export const Display = ({ children, className }: TypographyProps) => (
  <h1 className={cn(
    "scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl text-balance",
    className
  )}>
    {children}
  </h1>
);

// H1 - Page titles
export const H1 = ({ children, className }: TypographyProps) => (
  <h1 className={cn(
    "scroll-m-20 text-3xl font-bold tracking-tight sm:text-4xl text-balance",
    className
  )}>
    {children}
  </h1>
);

// H2 - Section titles
export const H2 = ({ children, className }: TypographyProps) => (
  <h2 className={cn(
    "scroll-m-20 text-2xl font-semibold tracking-tight sm:text-3xl",
    className
  )}>
    {children}
  </h2>
);

// H3 - Subsection titles
export const H3 = ({ children, className }: TypographyProps) => (
  <h3 className={cn(
    "scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl",
    className
  )}>
    {children}
  </h3>
);

// H4 - Card/component titles
export const H4 = ({ children, className }: TypographyProps) => (
  <h4 className={cn(
    "scroll-m-20 text-lg font-semibold tracking-tight sm:text-xl",
    className
  )}>
    {children}
  </h4>
);

// Paragraph - Body text
export const Paragraph = ({ children, className }: TypographyProps) => (
  <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
    {children}
  </p>
);

// Lead - Larger intro paragraphs
export const Lead = ({ children, className }: TypographyProps) => (
  <p className={cn("text-lg sm:text-xl text-muted-foreground text-balance", className)}>
    {children}
  </p>
);

// Small - Helper text, captions
export const Small = ({ children, className }: TypographyProps) => (
  <small className={cn("text-sm font-medium leading-none", className)}>
    {children}
  </small>
);

// Muted - Secondary text
export const Muted = ({ children, className }: TypographyProps) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
);

// Code - Inline code
export const InlineCode = ({ children, className }: TypographyProps) => (
  <code className={cn(
    "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium",
    className
  )}>
    {children}
  </code>
);

// Blockquote
export const Blockquote = ({ children, className }: TypographyProps) => (
  <blockquote className={cn(
    "mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground",
    className
  )}>
    {children}
  </blockquote>
);

// List
export const List = ({ children, className }: TypographyProps) => (
  <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}>
    {children}
  </ul>
);

// Usage examples and documentation
export const TypographyShowcase = () => (
  <div className="space-y-8 p-8">
    <div>
      <Display>Display Text</Display>
      <Muted>Used for hero sections and major headings</Muted>
    </div>
    
    <div>
      <H1>Heading 1</H1>
      <Muted>Page titles and main headers</Muted>
    </div>
    
    <div>
      <H2>Heading 2</H2>
      <Muted>Section titles</Muted>
    </div>
    
    <div>
      <H3>Heading 3</H3>
      <Muted>Subsection titles</Muted>
    </div>
    
    <div>
      <H4>Heading 4</H4>
      <Muted>Card and component titles</Muted>
    </div>
    
    <div>
      <Lead>
        This is a lead paragraph with larger text, perfect for introductions and important content.
      </Lead>
    </div>
    
    <div>
      <Paragraph>
        This is a regular paragraph with comfortable line height and spacing. 
        It's designed for optimal readability across different screen sizes.
      </Paragraph>
    </div>
    
    <div>
      <Small>Small text for captions and helper text</Small>
    </div>
    
    <div>
      <Muted>Muted text for secondary information</Muted>
    </div>
    
    <div>
      <InlineCode>const code = "example";</InlineCode>
    </div>
    
    <Blockquote>
      "This is a blockquote for highlighting important quotes or testimonials."
    </Blockquote>
    
    <List>
      <li>First list item</li>
      <li>Second list item</li>
      <li>Third list item</li>
    </List>
  </div>
);

