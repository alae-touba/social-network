import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Question/answer content may contain HTML written in the old rich-text
 * editor. HTML is rendered through Angular's sanitizer; plain text keeps its
 * line breaks. Either way the result can never execute scripts.
 */
@Pipe({ name: 'safeContent' })
export class SafeContentPipe implements PipeTransform {
	private readonly sanitizer = inject(DomSanitizer);

	transform(value: string | null | undefined): SafeHtml {
		const content = value ?? '';
		if (/<[a-z][\s\S]*>/i.test(content)) {
			return this.sanitizer.sanitize(SecurityContext.HTML, content) ?? '';
		}
		const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return this.sanitizer.bypassSecurityTrustHtml(escaped.replace(/\n/g, '<br>'));
	}
}
