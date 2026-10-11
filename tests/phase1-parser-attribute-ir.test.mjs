import test from 'node:test';
import assert from 'node:assert/strict';
import { parseComponent } from '../packages/compiler/src/index.mjs';

test('hierarchical AST preserves typed exact-span IR for all five ratified attribute forms', () => {
  const source = `<input disabled id='card' class="field {active ? 'active' : ''}" aria-label={value} {active} {...attrs} on:click={handleClick} />`;
  const component = parseComponent(source, { filename: 'Attributes.nomos' });
  assert.equal(component.diagnostics.length, 0);

  const element = component.sections[0].ast.children[0];
  assert.equal(element.type, 'Element');
  assert.deepEqual(element.attributes.map((attribute) => attribute.kind), [
    'static', 'static', 'mixed', 'dynamic', 'shorthand', 'spread',
  ]);

  const [booleanStatic, quotedStatic, mixed, dynamic, shorthand, spread] = element.attributes;

  assert.equal(booleanStatic.name, 'disabled');
  assert.equal(booleanStatic.value, null);
  assert.equal(booleanStatic.valueSpan, null);
  assert.equal(source.slice(booleanStatic.span.start.offset, booleanStatic.span.end.offset), 'disabled');
  assert.equal(source.slice(booleanStatic.nameSpan.start.offset, booleanStatic.nameSpan.end.offset), 'disabled');

  assert.equal(quotedStatic.name, 'id');
  assert.equal(quotedStatic.value, 'card');
  assert.equal(quotedStatic.quote, "'");
  assert.equal(source.slice(quotedStatic.valueSpan.start.offset, quotedStatic.valueSpan.end.offset), "'card'");

  assert.equal(mixed.name, 'class');
  assert.equal(mixed.quote, '"');
  assert.deepEqual(mixed.parts.map((part) => part.type), ['TextPart', 'ExpressionPart']);
  assert.equal(mixed.parts[0].raw, 'field ');
  assert.equal(mixed.parts[1].raw, "active ? 'active' : ''");
  assert.equal(source.slice(mixed.parts[1].span.start.offset, mixed.parts[1].span.end.offset), "{active ? 'active' : ''}");
  assert.equal(source.slice(mixed.parts[1].bodySpan.start.offset, mixed.parts[1].bodySpan.end.offset), "active ? 'active' : ''");

  assert.equal(dynamic.name, 'aria-label');
  assert.equal(dynamic.expression.raw, 'value');
  assert.equal(source.slice(dynamic.expression.span.start.offset, dynamic.expression.span.end.offset), '{value}');
  assert.equal(source.slice(dynamic.expression.bodySpan.start.offset, dynamic.expression.bodySpan.end.offset), 'value');

  assert.equal(shorthand.name, 'active');
  assert.equal(shorthand.expression.raw, 'active');
  assert.equal(source.slice(shorthand.span.start.offset, shorthand.span.end.offset), '{active}');

  assert.equal(spread.name, null);
  assert.equal(spread.expression.raw, 'attrs');
  assert.equal(source.slice(spread.span.start.offset, spread.span.end.offset), '{...attrs}');

  assert.deepEqual(element.directives.map(({ kind, name }) => [kind, name]), [['on', 'click']]);
  assert.equal(source.slice(element.directives[0].span.start.offset, element.directives[0].span.end.offset), 'on:click={handleClick}');
});

test('attribute IR preserves nested TypeScript brace expressions and mixed-text boundaries', () => {
  const source = `<div data-meta={{ nested: { value: 1 } }} title="before {format({ value: 2 })} after"></div>`;
  const component = parseComponent(source, { filename: 'NestedAttributes.nomos' });
  assert.equal(component.diagnostics.length, 0);

  const element = component.sections[0].ast.children[0];
  const [dynamic, mixed] = element.attributes;

  assert.equal(dynamic.kind, 'dynamic');
  assert.equal(dynamic.expression.raw, '{ nested: { value: 1 } }');
  assert.deepEqual(mixed.parts.map((part) => part.type), ['TextPart', 'ExpressionPart', 'TextPart']);
  assert.equal(mixed.parts[0].raw, 'before ');
  assert.equal(mixed.parts[1].raw, 'format({ value: 2 })');
  assert.equal(mixed.parts[2].raw, ' after');
});
