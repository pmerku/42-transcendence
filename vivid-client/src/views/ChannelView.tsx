import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { MainLayout } from './layouts/MainLayout';
import './ChannelView.css';
import { Icon } from '../components/styled/Icon';
import { useFetch } from '../hooks/useFetch';
import { NotFoundView } from './NotFoundView';
import { MessageView } from './channel/MessageView';

function ChannelViewLoading(props: { loading: boolean }) {
  if (props.loading) return <p>Loading...</p>;
  else return <NotFoundView>Couldn&apos;t find this channel</NotFoundView>;
}

function ChannelLeaveIcon(props: { onClick?: () => void }) {
  return (
    <span className="channelViewEdit red" onClick={props.onClick}>
      <Icon type="leave" />
    </span>
  );
}

function ChannelEditIcon(props: { onClick?: () => void }) {
  return (
    <span className="channelViewEdit" onClick={props.onClick}>
      <Icon type="gear" />
    </span>
  );
}

export function ChannelView() {
  const { id }: any = useParams();
  const history = useHistory();
  const messageData = useMessages(id);
  const { currentChannelUser } = messageData;

  const leaveChannelFetch = useFetch({
    url: '',
    method: 'DELETE',
  });

  React.useEffect(() => {
    if (leaveChannelFetch.done) {
      // TODO update joined channel list
      leaveChannelFetch.reset();
    }
  }, [leaveChannelFetch.done]);

  if (messageData.messageState.error || messageData.messageState.loading)
    return <ChannelViewLoading loading={!!messageData.messageState.loading} />;

  if (
    !messageData?.currentChannelUser?.user?.is_joined ||
    messageData.channelInfo.dmId
  )
    return <ChannelViewLoading loading={false} />;

  return (
    <MainLayout
      title={
        (messageData.messageState.done && messageData.channelInfo.title) || '‎'
      }
      actions={
        <div>
          {['owner', 'mod'].includes(currentChannelUser.tag) ? (
            <ChannelEditIcon
              onClick={() => history.push(`/channel/${id}/settings`)}
            />
          ) : null}
          <ChannelLeaveIcon
            onClick={() =>
              leaveChannelFetch.run(
                null,
                `/api/v1/channels/${id}/users/${currentChannelUser.user.user}`,
              )
            }
          />
        </div>
      }
    >
      <MessageView channelId={id} messageData={messageData} />
    </MainLayout>
  );
}
