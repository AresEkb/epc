package epc;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.xmi.impl.XMIResourceImpl;

public class EpcResource extends XMIResourceImpl {

    public EpcResource(URI uri) {
        super(uri);
    }

    @Override
    protected boolean useUUIDs() {
        return true;
    }

}
