import { STATEMENTS_QUERY } from '@/helpers/queries';
import { Statement } from '@/helpers/interfaces';

const SET_STATEMENT_ACTION = 'set-statement';

const statements = ref<Record<string, Statement>>({});
const savedSpaceId = ref<string>('');

export function useStatement() {
  const { send, isSending } = useClient();
  const { apolloQuery } = useApolloQuery();
  const { notify } = useFlashNotification();
  const { formatNumber, getNumberFormatter, getPercentFractionDigits } =
    useIntl();

  const loadingStatements = ref(false);

  async function saveStatement(
    spaceId: string,
    about: string,
    statement: string
  ) {
    const result = await send({ id: spaceId }, SET_STATEMENT_ACTION, {
      about,
      statement
    });
    if (result) {
      notify(['green', 'Statement saved successfully']);
    }
  }

  async function loadStatements(spaceId: string, delegateIds: string[]) {
    loadingStatements.value = true;

    if (savedSpaceId.value !== spaceId) {
      statements.value = {};
      savedSpaceId.value = spaceId;
    }

    try {
      const filteredDelegateIds = delegateIds.filter(
        id => !statements.value[id]
      );
      if (!filteredDelegateIds.length) return;

      const response: Statement[] = await apolloQuery(
        {
          query: STATEMENTS_QUERY,
          variables: {
            space: spaceId,
            delegate_in: filteredDelegateIds
          }
        },
        'statements'
      );

      if (!response) throw new Error('No statements found');

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
    return statements.value[id.toLowerCase()]?.about;
  }

  function getStatementStatement(id: string): string | undefined {
    return statements.value[id.toLowerCase()]?.statement;
  }

  function formatPercentageNumber(value: string | number) {
    const fractionDigits = getPercentFractionDigits(Number(value));
    return formatNumber(
      Number(value),
      getNumberFormatter({
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }).value
    );
  }

  return {
    statements: computed(() => statements.value),
    loadingStatements: computed(() => loadingStatements.value),
    savingStatement: computed(() => isSending.value),
    saveStatement,
    loadStatements,
    reloadStatement,
    getStatementAbout,
    getStatementStatement,
    formatPercentageNumber
  };
}
