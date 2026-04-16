import Handlebars from 'handlebars';

type HandlebarsTemplateDelegate = ReturnType<typeof Handlebars.compile>;

export class TemplateEngine {
  private readonly hbs: typeof Handlebars;
  private readonly cache = new Map<string, HandlebarsTemplateDelegate>();

  constructor() {
    this.hbs = Handlebars.create();
    this.registerHelpers();
  }

  private registerHelpers(): void {
    // {{#is value "expected"}}...{{else}}...{{/is}}
    this.hbs.registerHelper('is', function (
      this: unknown,
      value: unknown,
      expected: unknown,
      options: Handlebars.HelperOptions,
    ) {
      return value === expected ? options.fn(this) : options.inverse(this);
    });

    // {{#unless-is value "expected"}}...{{else}}...{{/unless-is}}
    this.hbs.registerHelper('unless-is', function (
      this: unknown,
      value: unknown,
      expected: unknown,
      options: Handlebars.HelperOptions,
    ) {
      return value !== expected ? options.fn(this) : options.inverse(this);
    });

    // {{#includes array "item"}}...{{else}}...{{/includes}}
    this.hbs.registerHelper('includes', function (
      this: unknown,
      array: unknown,
      item: unknown,
      options: Handlebars.HelperOptions,
    ) {
      const hit = Array.isArray(array) && array.includes(item);
      return hit ? options.fn(this) : options.inverse(this);
    });
  }

  registerPartials(partials: Record<string, string>): void {
    for (const [name, template] of Object.entries(partials)) {
      this.hbs.registerPartial(name, template);
    }
  }

  render(template: string, context: Record<string, unknown>): string {
    let compiled = this.cache.get(template);
    if (!compiled) {
      compiled = this.hbs.compile(template);
      this.cache.set(template, compiled);
    }
    return compiled(context);
  }
}
