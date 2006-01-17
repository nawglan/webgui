package WebGUI::Asset::Template::HTMLTemplateExpr;

=head1 LEGAL

 -------------------------------------------------------------------
  WebGUI is Copyright 2001-2006 Plain Black Corporation.
 -------------------------------------------------------------------
  Please read the legal notices (docs/legal.txt) and the license
  (docs/license.txt) that came with this distribution before using
  this software.
 -------------------------------------------------------------------
  http://www.plainblack.com                     info@plainblack.com
 -------------------------------------------------------------------

=cut

use strict;
use base 'WebGUI::Asset::Template::Parser';
use HTML::Template::Expr;


#-------------------------------------------------------------------

=head2 getName ( )

Returns the human readable name of this parser.

=cut

sub getName {
        my $self = shift;
        return "HTML::Template::Expr";
}

#-------------------------------------------------------------------

=head2 process ( template, vars )

Evaluate a template replacing template commands for HTML. 

=head3 template

A scalar variable containing the template.

=head3 vars

A hash reference containing template variables and loops. 

=cut

sub process {
	my $class = shift;
	my $template = shift;
	my $vars = $self->addSessionVars(shift);
 	my $t;
        eval {
                $t = HTML::Template::Expr->new(scalarref=>\$template,
                global_vars=>1,
                loop_context_vars=>1,
                die_on_bad_params=>0,
                no_includes=>1,
                strict=>0);
        };
        unless ($@) {
                $t->param(%{$vars});
                return $t->output;
        } else {
                $self->session->errorHandler->error("Error in template. ".$@);
                return WebGUI::International->new($self->session,'Asset_Template')->get('template error').$@;
        }	
}

1;
