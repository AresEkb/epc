/*
 * generated by Xtext 2.20.0
 */
package epc.text.ide;

import com.google.inject.Guice;
import com.google.inject.Injector;
import epc.text.EpcRuntimeModule;
import epc.text.EpcStandaloneSetup;
import org.eclipse.xtext.util.Modules2;

/**
 * Initialization support for running Xtext languages as language servers.
 */
public class EpcIdeSetup extends EpcStandaloneSetup {

	@Override
	public Injector createInjector() {
		return Guice.createInjector(Modules2.mixin(new EpcRuntimeModule(), new EpcIdeModule()));
	}
	
}
