package WebGUI::Config;

=head1 LEGAL

 -------------------------------------------------------------------
  WebGUI is Copyright 2001-2004 Plain Black LLC.
 -------------------------------------------------------------------
  Please read the legal notices (docs/legal.txt) and the license
  (docs/license.txt) that came with this distribution before using
  this software.
 -------------------------------------------------------------------
  http://www.plainblack.com                     info@plainblack.com
 -------------------------------------------------------------------

=cut

use strict;
use Parse::PlainConfig;

our %config;

=head1 NAME

Package WebGUI::Config

=head1 DESCRIPTION

This package parses the WebGUI config file.

=head1 SYNOPSIS

 use WebGUI::Config;

 $hashRef = WebGUI::Config::getConfig($webguiRoot, $configFile);
 $hashRef = WebGUI::Config::readConfig($webguiRoot, $configFile);

 WebGUI::Config::loadAllConfigs($webguiRoot);

=head1 METHODS

These subroutines are available from this package:

=cut



#-------------------------------------------------------------------

=head2 getConfig ( webguiRoot , configFile )

Returns a hash reference containing the configuration data. It tries to get the data out of the memory cache first, but reads the config file directly if necessary.

=over

=item webguiRoot

The path to the WebGUI installation.

=item configFile

The filename of the config file to read.

=back

=cut

sub getConfig {
	my $webguiPath = shift;
	my $filename = shift;
	if (exists $config{$filename}) {
		return $config{$filename};
	} else {
		return readConfig($webguiPath,$filename);
	}
}


#-------------------------------------------------------------------

=head2 loadAllConfigs ( webguiRoot )

Reads all the config file data for all defined sites into an in-memory cache.

=over

=item webguiRoot

The path to the WebGUI installation.

=back

=cut

sub loadAllConfigs {
	my $webguiPath = shift;
	opendir(DIR,$webguiPath."/etc");
	my @files = readdir(DIR);
	closedir(DIR);
	foreach my $file (@files) {
		if ($file =~ /\.conf$/ && !($file =~ /^demo\d/)) {
			print "\tLoading ".$file."\n";	
			$config{$file} = readConfig($webguiPath,$file);
		}
	}
}


#-------------------------------------------------------------------

=head2 readConfig ( webguiRoot , configFile )

Returns a hash reference containing the configuration data. It reads the config data directly from the file.

=over

=item webguiRoot

The path to the WebGUI installation.

=item configFile

The filename of the config file to read.

=back

=cut

sub readConfig {
	my $webguiPath = shift;
	my $filename = shift;
	my $config = Parse::PlainConfig->new('DELIM' => '=', 
                'FILE' => $webguiPath.'/etc/'.$filename,
                'PURGE' => 1);
	my %data;
        foreach my $key ($config->directives) {
                $data{$key} = $config->get($key);
        }
        if (ref $data{authMethods} ne "ARRAY") {
                $data{authMethods} = [$data{authMethods}];
        }
	if (ref $data{wobjects} ne "ARRAY"){
		$data{wobjects} = [$data{wobjects}];
	}
        if( defined( $data{scripturl} ) ) {
                # get rid of leading "/" if present.
                $data{scripturl} =~ s/^\///;
        }
        if (ref $data{sitename} eq "ARRAY") {
                $data{defaultSitename} = $data{sitename}[0];
        } else {
                $data{defaultSitename} = $data{sitename};
        }
	$data{webguiRoot} = $webguiPath;
	$data{configFile} = $filename;
	return \%data;
}



1;

