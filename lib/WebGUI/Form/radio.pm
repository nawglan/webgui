package WebGUI::Form::radio;

=head1 LEGAL

 -------------------------------------------------------------------
  WebGUI is Copyright 2001-2005 Plain Black Corporation.
 -------------------------------------------------------------------
  Please read the legal notices (docs/legal.txt) and the license
  (docs/license.txt) that came with this distribution before using
  this software.
 -------------------------------------------------------------------
  http://www.plainblack.com                     info@plainblack.com
 -------------------------------------------------------------------

=cut

use strict;
use base 'WebGUI::Form::Control';
use WebGUI::International;
use WebGUI::Session;

=head1 NAME

Package WebGUI::Form::radio

=head1 DESCRIPTION

Creates a radio button form field.

=head1 SEE ALSO

This is a subclass of WebGUI::Form::Control.

=head1 METHODS 

The following methods are specifically available from this class. Check the superclass for additional methods.

=cut

#-------------------------------------------------------------------

=head2 definition ( [ additionalTerms ] )

See the super class for additional details.

=head3 additionalTerms

The following additional parameters have been added via this sub class.

=head4 checked

Defaults to "0". Set to "1" if this field should be checked.

=cut

sub definition {
	my $class = shift;
	my $definition = shift || [];
	push(@{$definition}, {
		checked=>{
			defaultValue=> 0
			}
		});
	return $class->SUPER::definition($definition);
}


#-------------------------------------------------------------------

=head2 getName ()

Returns the human readable name or type of this form control.

=cut

sub getName {
        return WebGUI::International::get("radio","WebGUI");
}


#-------------------------------------------------------------------

=head2 toHtml ( )

Renders and input tag of type radio.

=cut

sub toHtml {
	my $self = shift;
	my $value = $self->fixMacros($self->fixQuotes($self->fixSpecialCharacters($self->{value})));
	my $checkedText = ' checked="checked"' if ($self->{checked});
	return '<input type="radio" name="'.$self->{name}.'" value="'.$value.'"'.$checkedText.' '.$self->{extras}.' />';
}


1;

