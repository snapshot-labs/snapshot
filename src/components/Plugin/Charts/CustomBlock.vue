<script setup>
import { ref, computed, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  space: Object,
  proposal: Object,
  votes: Object,
});

const totalVotesPerDayChart = ref(null);
const votingPowerPerAddress = ref(null);
const votingPowerPerDay = ref(null);

const space = computed(() => props.space);
const proposal = computed(() => props.proposal);
const votes = computed(() => {
  votes.sort((a, b) => a.created - b.created);
  return votes;
});

onMounted(() => {
  const canvasRef = totalVotesPerDayChart.value;
  if (! canvasRef) {
    return;
  }

  const dates = new Map();

  votes.value.forEach(vote => {
    const date = new Date(vote.created * 1000);
    const day = `${date.getMonth() + 1}/${date.getDate() + 1}`;

    const value = dates.get(day);
    if (value) {
      dates.set(day, value + 1);
    } else {
      dates.set(day, 1);
    }
  });

  const labels = Array.from(dates.keys());
  const data = {
    labels: labels,
    datasets: [{
      label: 'Total votes per day',
      data: Array.from(dates.values()),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Votes added per day'
        }
      }
    }
  };

  new Chart(canvasRef, config);
});

onMounted(() => {
  const canvasRef = votingPowerPerAddress.value;
  if (! canvasRef) {
    return;
  }

  const MAX_ADDRESSES = 20;

  const newVotes = [...votes.value];
  newVotes.sort((a, b) => b.balance - a.balance);

  let labels = newVotes.map(vote => vote.voter);
  let balances = newVotes.map(vote => vote.balance);

  if (newVotes.length > MAX_ADDRESSES + 1) {
    const extraBalances = balances.slice(MAX_ADDRESSES).reduce((total, current) => total + current);
    labels = labels.slice(0, MAX_ADDRESSES);
    balances = balances.slice(0, MAX_ADDRESSES);
    labels.push('Others');
    balances.push(extraBalances);
  }

  const data = {
    labels,
    datasets: [{
      label: 'Share of voting power',
      data: balances,
      backgroundColor: labels.map(label => label === 'Others' ? '#cccccc' : '#' + label.substr(-6)),
    }]
  };

  const config = {
    type: 'doughnut',
    data: data,
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'right'
        },
        title: {
          display: true,
          text: 'Share of voting power'
        }
      }
    }
  };

  new Chart(canvasRef, config);
});

onMounted(() => {
  const canvasRef = votingPowerPerDay.value;
  if (! canvasRef) {
    return;
  }

  const datasets = proposal.value.choices.map((choice, index) => {
    const votesForThisChoice = votes.value.filter(vote => vote.choice === index + 1);
    const data = votesForThisChoice.reduce((result, current, index) => {
      const date = new Date(current.created * 1000).toString()
      const balance = current.balance;

      if (index === 0) {
        return [{ x: date, y: balance }];
      }
      
      const previous = result[index - 1];
      return result.concat({ x: date, y: previous.y + balance });
    }, []);

    return {
      label: choice,
      data,
      fill: false,
      borderColor: votesForThisChoice.length > 0 ? '#' + votesForThisChoice[0].voter.substr(-6) : '', // as close to random as it gets
      tension: .1,
    }
  });

  const data = { datasets };
  const options = {
    scales: {
      x: {
        ticks: {
          display: false,
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Power used across time'
      }
    }
  };

  new Chart(canvasRef, { type: 'line', data, options });
});

</script>

<template>
  <Block :title="$t('charts.charts')">
    <div v-if="votes.length > 0">
      <div v-if="space.plugins?.charts.total_votes_per_day.enable">
        <canvas ref="totalVotesPerDayChart" />
      </div>
      <div v-if="space.plugins?.charts.voting_power_per_address.enable">
        <canvas ref="votingPowerPerAddress" />
      </div>
      <div v-if="space.plugins?.charts.voting_power_per_day.enable">
        <canvas ref="votingPowerPerDay" />
      </div>
    </div>
    <div v-if="votes.length === 0">
      {{ $t('charts.noVotesYet' ) }}
    </div>
  </Block>
</template>
