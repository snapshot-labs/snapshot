import { STATEMENTS_QUERY } from '@/helpers/queries';
import { Statement } from '@/helpers/interfaces';

export function useStatement() {
  const { send, isSending } = useClient();
  const { apolloQuery } = useApolloQuery();
  const { notify } = useFlashNotification();

  const statements = ref<Record<string, Statement>>({});
  const loadingStatements = ref(false);

  async function setStatement(
    space: { id: string },
    about: string,
    statement: string
  ) {
    const result = await send(space, 'set-statement', {
      about,
      statement
    });
    if (result) {
      notify(['green', 'Statement set successfully']);
    }
  }

  async function loadStatements(spaceId: string, delegates: string[]) {
    delegates = delegates.filter(id => !statements.value[id]);
    loadingStatements.value = true;
    try {
      const response: Statement[] = await apolloQuery(
        {
          query: STATEMENTS_QUERY,
          variables: {
            space: spaceId,
            delegates_in: delegates
          }
        },
        'statements'
      );

      if (!response) return;

      const newStatements = response.reduce((acc, statement) => {
        acc[statement.delegate.toLowerCase()] = statement;
        return acc;
      }, {} as Record<string, Statement>);
      statements.value = { ...statements.value, ...newStatements };
    } catch (e) {
      console.error(e);
    } finally {
      loadingStatements.value = false;
    }
  }

  function reloadStatement(spaceId: string, id: string) {
    id = id.toLowerCase();
    delete statements.value[id];
    loadStatements(spaceId, [id]);
  }

  function getStatementAbout(id: string): string | undefined {
    return statements.value?.[id.toLowerCase()]?.about;
  }

  function getStatementStatement(id: string): string | undefined {
    return statements.value?.[id.toLowerCase()]?.statement;
  }

  return {
    statements: computed(() => statements.value),
    loadingStatements: computed(() => loadingStatements.value),
    settingStatement: computed(() => isSending.value),
    setStatement,
    loadStatements,
    reloadStatement,
    getStatementAbout,
    getStatementStatement
  };
}
