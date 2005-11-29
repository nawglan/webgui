package WebGUI::Asset::Wobject::Dashboard;

#-------------------------------------------------------------------
# WebGUI is Copyright 2001-2005 Plain Black Corporation.
#-------------------------------------------------------------------
# Please read the legal notices (docs/legal.txt) and the license
# (docs/license.txt) that came with this distribution before using
# this software.
#-------------------------------------------------------------------
# http://www.plainblack.com                     info@plainblack.com
#-------------------------------------------------------------------

use strict;
use Tie::IxHash;
use WebGUI::International;
use WebGUI::Utility;
use WebGUI::Session;
use WebGUI::Grouping;
use WebGUI::Privilege;
use WebGUI::ErrorHandler;
use Time::HiRes;
use WebGUI::Asset::Field;
use WebGUI::Style;
use WebGUI::Asset::Wobject;

our @ISA = qw(WebGUI::Asset::Wobject);


#-------------------------------------------------------------------
sub canManage {
	my $self = shift;
	return WebGUI::Grouping::isInGroup($self->get("adminsGroupId"));
}

#-------------------------------------------------------------------
sub canPersonalize {
	my $self = shift;
	return WebGUI::Grouping::isInGroup($self->get("usersGroupId"));
}


#-------------------------------------------------------------------
sub definition {
	my $class = shift;
	my $definition = shift;
	my %properties;
	tie %properties, 'Tie::IxHash';
	%properties = (
		templateId =>{
			fieldType=>"template",
			defaultValue=>'DashboardViewTmpl00001',
			namespace=>"Dashboard"
		},
		adminsGroupId =>{
			fieldType=>"group",
			defaultValue=>4
		},
		usersGroupId =>{
			fieldType=>"group",
			defaultValue=>2
		},
		mapFieldId =>{
			fieldType=>"text",
			defaultValue=>''
		}
	);
	push(@{$definition}, {
		assetName=>WebGUI::International::get('assetName',"Asset_Dashboard"),
		icon=>'dashboard.gif',
		tableName=>'Dashboard',
		className=>'WebGUI::Asset::Wobject::Dashboard',
		properties=>\%properties
	});
	return $class->SUPER::definition($definition);
}

#-------------------------------------------------------------------
sub getContentPositions {
	my $self = shift;
	my $dummy = $self->initializeDashletFields unless $self->get("mapFieldId");
	return WebGUI::Asset::Field->getUserPref($self->get("mapFieldId"));
}

#-------------------------------------------------------------------
sub getEditForm {
	my $self = shift;
	my $tabform = $self->SUPER::getEditForm;
	my $i18n = WebGUI::International->new("Asset_Dashboard");
	$tabform->getTab("display")->template(
		-value=>$self->getValue('templateId'),
		-namespace=>"Dashboard",
		-label=>$i18n->get('dashboard template field label'),
		-hoverHelp=>$i18n->get('dashboard template description'),
	);
	$tabform->getTab("security")->group(
		-name=>"adminsGroupId",
		-label=>$i18n->get('dashboard adminsGroupId field label'),
		-hoverHelp=>$i18n->get('dashboard adminsGroupId description'),
		-value=>[$self->get("adminsGroupId")]
	);
	$tabform->getTab("security")->group(
		-name=>"usersGroupId",
		-label=>$i18n->get('dashboard usersGroupId field label'),
		-hoverHelp=>$i18n->get('dashboard usersGroupId description'),
		-value=>[$self->get("usersGroupId")]
	);
	return $tabform;
}

#-------------------------------------------------------------------
sub initializeDashletFields {
	my $self = shift;
	my $child = $self->addChild({
		className=>'WebGUI::Asset::Field',
		title=>'Dashboard User Preference - Content Positions',
		menuTitle=>'Dashboard User Preference - Content Positions',
		isHidden=>1,
		startDate=>$self->get("startDate"),
		endDate=>$self->get("endDate"),
		ownerUserId=>$self->get("ownerUserId"),
		groupIdEdit=>$self->get("groupIdEdit"),
		groupIdView=>$self->get("groupIdView"),
		url=>'Dashboard User Preference - Content Positions',
		isUserPref=>1,
		fieldName=>'contentPositions'
	});
	$self->update({mapFieldId=>$child->getId});
}


#-------------------------------------------------------------------
sub isManaging {
	my $self = shift;
	return 1 if ($self->canManage && WebGUI::Session::isAdminOn());
	return 0;
}

#-------------------------------------------------------------------
sub processPropertiesFromFormPost {
	my $self = shift;
	$self->SUPER::processPropertiesFromFormPost;
	if ($session{form}{assetId} eq "new" && $session{form}{class} eq 'WebGUI::Asset::Wobject::Dashboard') {
		$self->initializeDashletFields;
		$self->update({styleTemplateId=>'PBtmplBlankStyle000001'});
	}
}


#-------------------------------------------------------------------
sub view {
	my $self = shift;
	my %vars = $self->get();
	my $templateId = $self->get("templateId");
	my $children = $self->getLineage( ["children"], { returnObjects=>1, excludeClasses=>["WebGUI::Asset::Field","WebGUI::Asset::Wobject::Layout","WebGUI::Asset::Wobject::Dashboard"] });
	my %vars;
	# I'm sure there's a more efficient way to do this. We'll figure it out someday.
	my @positions = split(/\./,$self->getContentPositions);
	my @hidden = split("\n",$self->get("assetsToHide"));
	foreach my $child (@{$children}) {
		push(@hidden,$child->get('shortcutToAssetId')) if ref $child eq 'WebGUI::Asset::Shortcut';
	}
	my $i = 1;
	my $templateAsset = WebGUI::Asset->newByDynamicClass($templateId) || WebGUI::Asset->getImportNode;
	my $template = $templateAsset->get("template");
	my $numPositions = 1;
	foreach my $j (2..15) {
		$numPositions = $j if $template =~ m/position${j}\_loop/;
	}

	my @found;
	my $showPerformance = WebGUI::ErrorHandler::canShowPerformanceIndicators();
	foreach my $position (@positions) {
		my @assets = split(",",$position);
		foreach my $asset (@assets) {
			foreach my $child (@{$children}) {
				if ($asset eq $child->getId) {
					unless (isIn($asset,@hidden) || !($child->canView)) {
						WebGUI::Style::setRawHeadTags($child->getExtraHeadTags);
						my $t = [Time::HiRes::gettimeofday()] if ($showPerformance);
						my $view = $child->view;
						$view .= "Asset:".Time::HiRes::tv_interval($t) if ($showPerformance);
						$child->{_properties}{title} = $child->getShortcut->get("title") if ref $child eq 'WebGUI::Asset::Shortcut';
						if ($i > $numPositions) {
							push(@{$vars{"position1_loop"}},{
								id=>$child->getId,
								content=>$view,
								dashletTitle=>$child->get("title")
							});
						} else {
							push(@{$vars{"position".$i."_loop"}},{
								id=>$child->getId,
								content=>$view,
								dashletTitle=>$child->get("title")
							});
						}
					}
					push(@found, $child->getId);
				}
			}
		}
		$i++;
	}
	# deal with unplaced children
	foreach my $child (@{$children}) {
		unless (isIn($child->getId, @found)||isIn($child->getId,@hidden)) {
			if ($child->canView) {
				my $t = [Time::HiRes::gettimeofday()] if ($showPerformance);
				my $view = $child->view;
				$view .= "Asset:".Time::HiRes::tv_interval($t) if ($showPerformance);
				push(@{$vars{"position1_loop"}},{
					id=>$child->getId,
					content=>$view,
					dashletTitle=>$child->get("title")
				});
			}
		}
	}
	$vars{showAdmin} = ($session{var}{adminOn} && $self->canEdit);
		WebGUI::Style::setScript($session{config}{extrasURL}."/wobject/Dashboard/draggable.js",{ type=>"text/javascript" });
		WebGUI::Style::setLink($session{config}{extrasURL}."/wobject/Dashboard/draggable.css",{ type=>"text/css", rel=>"stylesheet", media=>"all" });
		$vars{"dragger.init"} = '
			<script type="text/javascript">
				dragable_init("'.$self->getUrl.'");
			</script>
			';

	return $self->processTemplate(\%vars, $templateId);
}

#-------------------------------------------------------------------
sub www_setContentPositions {
	my $self = shift;
	return WebGUI::Privilege::insufficient() unless ($self->canPersonalize);
	return '' unless $self->get("mapFieldId");
	my $success = WebGUI::Asset::Field->setUserPref($self->get("mapFieldId"),$session{form}{map});
	return "Map set: ".$session{form}{map} if $success;
	return "Map failed to set.";
}


#-------------------------------------------------------------------

=head2 www_view ( )

Returns the view() method of the asset object if the requestor canView.

=cut

sub www_view {
	my $self = shift;
	return $self->SUPER::www_view(1);
}




1;