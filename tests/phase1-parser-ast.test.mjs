import test from 'node:test';
import assert from 'node:assert/strict';
import { attachTemplateAsts, buildTemplateAst } from '../packages/compiler/src/template-ast.mjs';

function position(offset) { return { offset, line: 1, column: offset + 1 }; }
function span(start, end) { return { start: position(start), end: position(end) }; }
function syntaxFor(source, nodes) { return { type: 'TemplateSyntaxTree', span: span(0, source.length), nodes }; }

test('hierarchical AST owns element metadata, text, nested elements, and interpolation', () => {
  const source = '<section class="card">Hello <strong>{name}</strong>!</section>';
  const strongStart = source.indexOf('<strong>');
  const strongCloseStart = source.indexOf('</strong>');
  const sectionCloseStart = source.indexOf('</section>');
  const interpolationStart = source.indexOf('{name}');
  const syntax = syntaxFor(source, [
    { type:'ElementOpen', name:'section', category:'html', selfClosing:false, span:span(0, source.indexOf('>') + 1) },
    { type:'Attribute', name:'class', span:span(9, 21) },
    { type:'ElementOpen', name:'strong', category:'html', selfClosing:false, span:span(strongStart, strongStart + 8) },
    { type:'Interpolation', span:span(interpolationStart, interpolationStart + 6) },
    { type:'ElementClose', name:'strong', span:span(strongCloseStart, strongCloseStart + 9) },
    { type:'ElementClose', name:'section', span:span(sectionCloseStart, source.length) },
  ]);
  const ast = buildTemplateAst(source, syntax);
  const section = ast.children[0];
  assert.equal(section.type, 'Element');
  assert.deepEqual(section.attributes.map((node) => node.name), ['class']);
  assert.equal(section.children[0].value, 'Hello ');
  assert.equal(section.children[1].name, 'strong');
  assert.equal(section.children[1].children[0].type, 'Interpolation');
  assert.equal(section.children[2].value, '!');
  assert.equal(source.slice(section.span.start.offset, section.span.end.offset), source);
});

test('if block branches own their respective element subtrees', () => {
  const source = '{#if ready}<p>Yes</p>{:else}<p>No</p>{/if}';
  const firstOpen = source.indexOf('<p>');
  const firstClose = source.indexOf('</p>');
  const elseStart = source.indexOf('{:else}');
  const secondOpen = source.indexOf('<p>', elseStart);
  const secondClose = source.indexOf('</p>', secondOpen);
  const closeStart = source.indexOf('{/if}');
  const syntax = syntaxFor(source, [
    { type:'BlockOpen', kind:'if', span:span(0, source.indexOf('}') + 1) },
    { type:'ElementOpen', name:'p', category:'html', selfClosing:false, span:span(firstOpen, firstOpen + 3) },
    { type:'ElementClose', name:'p', span:span(firstClose, firstClose + 4) },
    { type:'BlockBranch', kind:'else', span:span(elseStart, elseStart + 7) },
    { type:'ElementOpen', name:'p', category:'html', selfClosing:false, span:span(secondOpen, secondOpen + 3) },
    { type:'ElementClose', name:'p', span:span(secondClose, secondClose + 4) },
    { type:'BlockClose', kind:'if', span:span(closeStart, source.length) },
  ]);
  const ast = buildTemplateAst(source, syntax);
  const block = ast.children[0];
  assert.equal(block.type, 'IfBlock');
  assert.deepEqual(block.branches.map((branch) => branch.kind), ['then', 'else']);
  assert.equal(block.branches[0].children[0].children[0].value, 'Yes');
  assert.equal(block.branches[1].children[0].children[0].value, 'No');
  assert.equal(block.span.end.offset, source.length);
});

test('component and custom-element ownership preserves directives and self-closing behavior', () => {
  const source = '<Profile let:user><strong>{user.name}</strong></Profile><account-badge status="active" />';
  const strongStart = source.indexOf('<strong>');
  const interpolationStart = source.indexOf('{user.name}');
  const strongClose = source.indexOf('</strong>');
  const profileClose = source.indexOf('</Profile>');
  const badgeStart = source.indexOf('<account-badge');
  const syntax = syntaxFor(source, [
    { type:'ElementOpen', name:'Profile', category:'component', selfClosing:false, span:span(0, source.indexOf('>') + 1) },
    { type:'Directive', kind:'let', name:'user', span:span(9, 17) },
    { type:'ElementOpen', name:'strong', category:'html', selfClosing:false, span:span(strongStart, strongStart + 8) },
    { type:'Interpolation', span:span(interpolationStart, interpolationStart + 11) },
    { type:'ElementClose', name:'strong', span:span(strongClose, strongClose + 9) },
    { type:'ElementClose', name:'Profile', span:span(profileClose, profileClose + 10) },
    { type:'ElementOpen', name:'account-badge', category:'custom-element', selfClosing:true, span:span(badgeStart, source.length) },
    { type:'Attribute', name:'status', span:span(source.indexOf('status='), source.indexOf(' />')) },
  ]);
  const ast = buildTemplateAst(source, syntax);
  const profile = ast.children[0];
  const badge = ast.children[1];
  assert.equal(profile.category, 'component');
  assert.deepEqual(profile.directives.map((node) => [node.kind, node.name]), [['let', 'user']]);
  assert.equal(profile.children[0].name, 'strong');
  assert.equal(badge.category, 'custom-element');
  assert.equal(badge.selfClosing, true);
  assert.deepEqual(badge.attributes.map((node) => node.name), ['status']);
});

test('attachTemplateAsts annotates template sections without changing non-template sections', () => {
  const source = '<p>Hello</p><script>const x = 1;</script>';
  const syntax = {
    type: 'TemplateSyntaxTree',
    span: span(0, 12),
    nodes: [
      { type:'ElementOpen', name:'p', category:'html', selfClosing:false, span:span(0,3) },
      { type:'ElementClose', name:'p', span:span(8,12) },
    ],
  };
  const result = { sections: [
    { kind: 'template', syntax },
    { kind: 'script', raw: '<script>const x = 1;</script>' },
  ] };
  attachTemplateAsts(source, result);
  assert.equal(result.sections[0].ast.type, 'Template');
  assert.equal(result.sections[0].ast.children[0].children[0].value, 'Hello');
  assert.equal(result.sections[1].ast, undefined);
});
