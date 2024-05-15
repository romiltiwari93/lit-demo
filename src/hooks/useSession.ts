import { useCallback, useState } from 'react';
import { AuthMethod } from '@lit-protocol/types';
import { getSessionSigs } from '../utils/lit';
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  newSessionCapabilityObject,
} from '@lit-protocol/auth-helpers';
import { IRelayPKP } from '@lit-protocol/types';
import { SessionSigs } from '@lit-protocol/types';

export default function useSession() {
  const [sessionSigs, setSessionSigs] = useState<SessionSigs>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  /**
   * Generate session sigs and store new session data
   */
  const initSession = useCallback(
    async (authMethod: AuthMethod, pkp: IRelayPKP): Promise<void> => {
      setLoading(true);
      setError(undefined);
      try {
        // Prepare session sigs params
        const chain = 'ethereum';
        const resourceAbilities = [
          {
            resource: new LitPKPResource(pkp.publicKey),
            ability: LitAbility.PKPSigning,
          },
        ];
        const expiration = new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7
        ).toISOString(); // 1 week

        const sessionCapabilityObject = newSessionCapabilityObject();
        const litPkpResource = new LitPKPResource(pkp.publicKey);
        sessionCapabilityObject.addCapabilityForResource(
          litPkpResource,
          LitAbility.PKPSigning
        );

        // Generate session sigs
        const sessionSigs = await getSessionSigs({
          pkpPublicKey: pkp.publicKey,
          authMethod,
          //@ts-ignore
          sessionSigsParams: {
            chain,
            expiration,
            resourceAbilityRequests: resourceAbilities,
            sessionCapabilityObject,
          },
        });

        setSessionSigs(sessionSigs);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    initSession,
    sessionSigs,
    loading,
    error,
  };
}
